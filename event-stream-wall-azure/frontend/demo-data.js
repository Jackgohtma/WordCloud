window.LOCAL_DEMO_RESPONSES = (() => {
  const wishes = [
    ...Array(10).fill("Automated reporting"),
    ...Array(5).fill("Smart document search"),
    ...Array(2).fill("Meeting summaries"),
    "AI email assistant",
    "Predictive maintenance",
    "Demand forecasting",
    "Voice data entry",
    "Invoice checking",
    "Shift planning",
    "Knowledge chatbot",
    "Quality alerts",
    "Training recommendations",
    "Data cleaning",
    "Project risk alerts",
    "Customer insights",
    "Translation assistant"
  ];
  const names = ["Aisha", "Ben", "Cheryl", "Daniel", "Elaine", "Farid", "Grace", "Hafiz", "Irene", "Jason", "Kai", "Lina", "Marcus", "Nadia", "Owen", "Priya", "Qian", "Ravi", "Sarah", "Terence", "Uma", "Victor", "Wendy", "Xin Yi", "Yasmin", "Zach", "Amelia", "Bryan", "Clara", "Dinesh"];
  const pledges = [
    "I will automate one repetitive report this month.",
    "I will use data to make our next planning decision.",
    "I will share one useful AI prompt with my team.",
    "I will test AI on a real operational challenge.",
    "I will improve the quality of the data I own.",
    "I will turn one manual checklist into a digital workflow.",
    "I will identify a process where AI can save time.",
    "I will learn how to ask better questions with data.",
    "I will help my team use AI responsibly.",
    "I will measure the impact of our next AI experiment.",
    "I will bring one data problem to ISD for discussion.",
    "I will document what works and share the learning.",
    "I will use dashboards during weekly discussions.",
    "I will challenge assumptions with evidence.",
    "I will simplify one report before automating it.",
    "I will protect confidential data when using AI tools.",
    "I will explore a chatbot for common team questions.",
    "I will help clean up duplicate information.",
    "I will use AI to prepare a better first draft.",
    "I will ask my colleagues which task wastes the most time.",
    "I will turn feedback into an actionable data point.",
    "I will experiment, learn, and improve quickly.",
    "I will make one decision faster with reliable data.",
    "I will promote responsible AI use in daily work.",
    "I will connect data across teams where appropriate.",
    "I will propose one practical AI use case.",
    "I will track the result, not just the activity.",
    "I will create space for my team to try new tools.",
    "I will turn an insight into a clear next action.",
    "I will share today's learning with my department."
  ];
  const baseTime = Date.now() - 29 * 60000;
  return wishes.map((aiWish, index) => ({
    id: `demo-${index + 1}`,
    name: names[index],
    futureExhibitionWish: ["More hands-on demonstrations", "Department use-case showcases", "Practical learning workshops"][index % 3],
    aiWish,
    feedback: pledges[index],
    submittedAt: new Date(baseTime + index * 60000).toISOString(),
    pinned: false,
    deleted: false
  }));
})();

