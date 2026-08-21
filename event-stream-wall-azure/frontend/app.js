const COLORS = ["#b7ff3c", "#5eead4", "#a78bfa", "#f472b6", "#facc15", "#60a5fa"];
const cloudNodes = new Map();
const messageNodes = new Map();
let refreshInProgress = false;
const IS_LOCAL_DEMO = ["localhost", "127.0.0.1"].includes(window.location.hostname);

function normalizeWish(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\p{Letter}\p{Number}]/gu, "");
}

function getLocalDemoData() {
  const rows = window.LOCAL_DEMO_RESPONSES || [];
  const groups = new Map();
  rows.forEach((row) => {
    const key = normalizeWish(row.aiWish);
    const existing = groups.get(key);
    if (existing) existing.count += 1;
    else groups.set(key, { key, phrase: row.aiWish, count: 1 });
  });
  return {
    phrases: [...groups.values()].sort((a, b) => b.count - a.count || a.phrase.localeCompare(b.phrase)),
    messages: rows
      .filter((row) => !row.deleted)
      .map((row) => ({ id: row.id, name: row.name, message: row.feedback, pinned: row.pinned, createdAt: row.submittedAt })),
    stats: { wishlistCount: rows.length, pledgeCount: rows.length }
  };
}

function hashValue(value, multiplier = 31) {
  let hash = 0;
  for (const character of value) hash = (hash * multiplier + character.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

function colorFor(value) {
  return COLORS[hashValue(value) % COLORS.length];
}

function fontSizeForVotes(count) {
  const capped = Math.min(Math.max(count, 1), 25);
  const progress = (capped - 1) / 24;
  return `${(18 + 102 * Math.pow(progress, 0.55)).toFixed(1)}px`;
}

function mixedCloudOrder(items) {
  const mixed = new Array(items.length);
  let left = Math.floor((items.length - 1) / 2);
  let right = left + 1;
  items.forEach((item, index) => {
    if (index === 0 || index % 2 === 0) mixed[left--] = item;
    else mixed[right++] = item;
  });
  return mixed.filter(Boolean);
}

function createCloudNode(item) {
  const word = document.createElement("span");
  word.className = "cloud-phrase word-new";
  word.dataset.key = item.key;
  word.append(document.createTextNode(""));
  const count = document.createElement("small");
  count.className = "vote-count";
  word.append(count);
  word.addEventListener("animationend", () => {
    word.classList.remove("word-new", "vote-bump");
    word.style.animationDelay = "";
  });
  return word;
}

function updateCloud(phrases) {
  const cloud = document.querySelector("#phrase-cloud");
  const activeKeys = new Set(phrases.map((item) => item.key));
  for (const [key, node] of cloudNodes) {
    if (!activeKeys.has(key)) {
      node.remove();
      cloudNodes.delete(key);
    }
  }

  const empty = cloud.querySelector(".empty-cloud");
  if (!phrases.length) {
    if (!empty) cloud.insertAdjacentHTML("beforeend", '<p class="empty-cloud">Waiting for the first idea…</p>');
    return;
  }
  empty?.remove();

  const leaderKey = phrases[0]?.key;
  mixedCloudOrder(phrases).forEach((item, index) => {
    let word = cloudNodes.get(item.key);
    const isNew = !word;
    if (!word) {
      word = createCloudNode(item);
      cloudNodes.set(item.key, word);
    }

    const previousCount = Number(word.dataset.count || 0);
    const countChanged = previousCount && previousCount !== item.count;
    const cappedCount = Math.min(item.count, 25);
    const progress = (cappedCount - 1) / 24;
    const isLeader = item.key === leaderKey;

    word.firstChild.nodeValue = item.phrase;
    word.lastElementChild.textContent = item.count > 1 ? `×${item.count}` : "";
    word.dataset.count = String(item.count);
    word.classList.toggle("popular-wish", item.count > 1);
    word.classList.toggle("single-wish", item.count === 1);
    word.classList.toggle("cloud-anchor", isLeader);
    word.title = `${item.count} ${item.count === 1 ? "vote" : "votes"}`;
    word.style.color = colorFor(item.key);
    word.style.fontSize = fontSizeForVotes(item.count);
    word.style.fontWeight = String(Math.round(560 + progress * 340));
    word.style.top = isLeader ? "0" : `${((hashValue(item.key, 33) % 7) - 3) * 5}px`;
    word.style.textShadow = item.count === 1 ? "none" : `0 0 ${10 + progress * 30}px currentColor`;
    if (isNew) word.style.animationDelay = `${Math.min(index * 35, 350)}ms`;
    if (countChanged) {
      word.classList.remove("vote-bump");
      void word.offsetWidth;
      word.classList.add("vote-bump");
    }
    cloud.append(word);
  });
}

function createMessageNode(item) {
  const article = document.createElement("article");
  article.className = "chat-message message-new";
  article.dataset.id = item.id;
  article.innerHTML = `
    <div class="avatar" aria-hidden="true"></div>
    <div class="message-content"><div class="message-meta"><strong></strong></div><p></p></div>
    <button class="comment-menu-button" type="button" aria-label="Pledge actions" aria-expanded="false">⋯</button>
    <div class="comment-menu" hidden>
      <button type="button" data-action="pin"></button>
      <button type="button" data-action="delete" class="delete-action">Delete</button>
    </div>`;
  article.addEventListener("animationend", () => article.classList.remove("message-new"));
  return article;
}

function updateMessageNode(node, item) {
  node.querySelector(".avatar").textContent = (item.name || "?").slice(0, 1).toUpperCase();
  node.querySelector(".message-meta strong").textContent = item.name || "Anonymous";
  node.querySelector(".message-content p").textContent = item.message;
  node.querySelector('[data-action="pin"]').textContent = item.pinned ? "Unpin" : "Pin";
  node.dataset.pinned = String(Boolean(item.pinned));
  node.classList.toggle("is-pinned", Boolean(item.pinned));
}

function updateComments(messages) {
  const feed = document.querySelector("#chat-feed");
  const pinnedFeed = document.querySelector("#pinned-feed");
  const previousIds = new Set(messageNodes.keys());
  const activeIds = new Set(messages.map((item) => item.id));
  const hasNewMessage = messages.some((item) => !previousIds.has(item.id));

  for (const [id, node] of messageNodes) {
    if (!activeIds.has(id)) {
      node.remove();
      messageNodes.delete(id);
    }
  }

  const empty = feed.querySelector(".empty-chat");
  if (!messages.length) {
    pinnedFeed.hidden = true;
    if (!empty) feed.insertAdjacentHTML("beforeend", '<div class="empty-chat"><span>☄</span><p>The conversation starts here.</p></div>');
    return;
  }
  empty?.remove();

  const chronological = [...messages].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const pinned = chronological.filter((item) => item.pinned);
  const regular = chronological.filter((item) => !item.pinned);

  for (const item of [...pinned, ...regular]) {
    let node = messageNodes.get(item.id);
    if (!node) {
      node = createMessageNode(item);
      messageNodes.set(item.id, node);
    }
    updateMessageNode(node, item);
    (item.pinned ? pinnedFeed : feed).append(node);
  }

  pinnedFeed.hidden = pinned.length === 0;
  if (hasNewMessage) requestAnimationFrame(() => { feed.scrollTop = feed.scrollHeight; });
}

function updateCounts(stats = {}) {
  const wishlist = Number(stats.wishlistCount || 0);
  const pledges = Number(stats.pledgeCount || 0);
  const wishlistLabel = document.querySelector("#wishlist-count");
  const pledgeLabel = document.querySelector("#pledge-count");
  const nextWishlist = `AI WISHLIST COUNTS ${wishlist}`;
  const nextPledges = `PLEDGE COUNTS ${pledges}`;
  if (wishlistLabel.textContent !== nextWishlist) wishlistLabel.textContent = nextWishlist;
  if (pledgeLabel.textContent !== nextPledges) pledgeLabel.textContent = nextPledges;
}

async function refresh() {
  if (refreshInProgress) return;
  refreshInProgress = true;
  const status = document.querySelector("#connection-status");
  try {
    if (IS_LOCAL_DEMO) {
      const data = getLocalDemoData();
      updateCloud(data.phrases);
      updateComments(data.messages);
      updateCounts(data.stats);
      status.textContent = "LOCAL DEMO";
      status.classList.add("online");
      return;
    }
    const response = await fetch("/api/live", { cache: "no-store" });
    if (!response.ok) throw new Error("Live feed unavailable");
    const data = await response.json();
    updateCloud(data.phrases || []);
    updateComments(data.messages || []);
    updateCounts(data.stats);
    status.textContent = "ONLINE";
    status.classList.add("online");
  } catch {
    status.textContent = "RECONNECTING";
    status.classList.remove("online");
  } finally {
    refreshInProgress = false;
  }
}

function closeAllMenus(except) {
  document.querySelectorAll(".comment-menu:not([hidden])").forEach((menu) => {
    if (menu !== except) {
      menu.hidden = true;
      menu.previousElementSibling?.setAttribute("aria-expanded", "false");
    }
  });
}

async function moderatePledge(id, action) {
  if (action === "delete" && !window.confirm("Delete this pledge from the live panel? The full survey response will remain in the administrator report.")) return;
  if (IS_LOCAL_DEMO) {
    const row = window.LOCAL_DEMO_RESPONSES.find((item) => item.id === id);
    if (!row) return;
    if (action === "pin") row.pinned = true;
    if (action === "unpin") row.pinned = false;
    if (action === "delete") row.deleted = true;
    await refresh();
    return;
  }
  const response = await fetch("/api/moderate-pledge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, action })
  });
  if (!response.ok) {
    window.alert("The pledge could not be updated. Please try again.");
    return;
  }
  await refresh();
}

document.addEventListener("click", (event) => {
  const menuButton = event.target.closest(".comment-menu-button");
  if (menuButton) {
    const menu = menuButton.nextElementSibling;
    const willOpen = menu.hidden;
    closeAllMenus(menu);
    menu.hidden = !willOpen;
    menuButton.setAttribute("aria-expanded", String(willOpen));
    return;
  }
  const actionButton = event.target.closest(".comment-menu [data-action]");
  if (actionButton) {
    const article = actionButton.closest(".chat-message");
    const action = actionButton.dataset.action === "pin" && article.dataset.pinned === "true" ? "unpin" : actionButton.dataset.action;
    closeAllMenus();
    void moderatePledge(article.dataset.id, action);
    return;
  }
  closeAllMenus();
});

const dialog = document.querySelector("#manual-entry-dialog");
const manualForm = document.querySelector("#manual-entry-form");
const manualStatus = document.querySelector("#manual-entry-status");
document.querySelector("#open-manual-entry").addEventListener("click", () => dialog.showModal());
document.querySelector("#close-manual-entry").addEventListener("click", () => dialog.close());
document.querySelector("#cancel-manual-entry").addEventListener("click", () => dialog.close());
dialog.addEventListener("cancel", () => dialog.close());

manualForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = manualForm.querySelector('[type="submit"]');
  const values = Object.fromEntries(new FormData(manualForm));
  submitButton.disabled = true;
  manualStatus.textContent = "Sending…";
  try {
    if (IS_LOCAL_DEMO) {
      window.LOCAL_DEMO_RESPONSES.push({
        id: `demo-manual-${Date.now()}`,
        name: String(values.name).trim(),
        futureExhibitionWish: String(values.futureExhibitionWish).trim(),
        aiWish: String(values.aiWish).trim(),
        feedback: String(values.feedback).trim(),
        submittedAt: new Date().toISOString(),
        pinned: false,
        deleted: false
      });
      manualForm.reset();
      manualStatus.textContent = "";
      dialog.close();
      await refresh();
      return;
    }
    const response = await fetch("/api/manual-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        futureExhibitionWish: values.futureExhibitionWish,
        aiWish: values.aiWish,
        feedback: values.feedback
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Unable to save the response.");
    manualForm.reset();
    manualStatus.textContent = "";
    dialog.close();
    await refresh();
  } catch (error) {
    manualStatus.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

refresh();
window.setInterval(() => {
  if (document.visibilityState === "visible") void refresh();
}, 10000);
