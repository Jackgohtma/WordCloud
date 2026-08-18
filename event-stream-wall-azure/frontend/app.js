const COLORS = ["#b7ff3c", "#5eead4", "#a78bfa", "#f472b6", "#facc15", "#60a5fa"];

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

function renderCloud(phrases) {
  const cloud = document.querySelector("#phrase-cloud");
  cloud.replaceChildren();
  if (!phrases.length) {
    const empty = document.createElement("p");
    empty.className = "empty-cloud";
    empty.textContent = "Waiting for the first idea…";
    cloud.append(empty);
    return;
  }

  mixedCloudOrder(phrases).forEach((item, index) => {
    const cappedCount = Math.min(item.count, 25);
    const progress = (cappedCount - 1) / 24;
    const isLeader = item.key === phrases[0].key;
    const word = document.createElement("span");
    word.className = `cloud-phrase ${item.count > 1 ? "popular-wish" : "single-wish"}${isLeader ? " cloud-anchor" : ""}`;
    word.title = `${item.count} ${item.count === 1 ? "vote" : "votes"}`;
    word.style.color = colorFor(item.key);
    word.style.fontSize = fontSizeForVotes(item.count);
    word.style.fontWeight = String(Math.round(560 + progress * 340));
    word.style.top = isLeader ? "0" : `${((hashValue(item.key, 33) % 7) - 3) * 5}px`;
    word.style.textShadow = item.count === 1 ? "none" : `0 0 ${10 + progress * 30}px currentColor`;
    word.style.animationDelay = `${Math.min(index * 40, 400)}ms`;
    word.append(document.createTextNode(item.phrase));
    if (item.count > 1) {
      const count = document.createElement("small");
      count.className = "vote-count";
      count.textContent = `×${item.count}`;
      word.append(count);
    }
    cloud.append(word);
  });
}

function renderComments(messages) {
  const feed = document.querySelector("#chat-feed");
  feed.replaceChildren();
  if (!messages.length) {
    const empty = document.createElement("div");
    empty.className = "empty-chat";
    empty.innerHTML = "<span>☄</span><p>The conversation starts here.</p>";
    feed.append(empty);
    return;
  }

  messages.forEach((item) => {
    const article = document.createElement("article");
    article.className = "chat-message";
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = (item.name || "?").slice(0, 1).toUpperCase();
    const content = document.createElement("div");
    content.className = "message-content";
    const meta = document.createElement("div");
    meta.className = "message-meta";
    const name = document.createElement("strong");
    name.textContent = item.name;
    const type = document.createElement("span");
    type.className = "message-type feedback";
    type.textContent = "COMMENT";
    const message = document.createElement("p");
    message.textContent = item.message;
    meta.append(name, type);
    content.append(meta, message);
    article.append(avatar, content);
    feed.append(article);
  });
}

async function refresh() {
  const status = document.querySelector("#connection-status");
  try {
    const response = await fetch("/api/live", { cache: "no-store" });
    if (!response.ok) throw new Error("Live feed unavailable");
    const data = await response.json();
    renderCloud(data.phrases || []);
    renderComments(data.messages || []);
    status.textContent = "ONLINE";
    status.classList.add("online");
  } catch {
    status.textContent = "RECONNECTING";
    status.classList.remove("online");
  }
}

refresh();
window.setInterval(refresh, 2000);
