// One-tap call outcomes on the Call Queue, and what the system does next for each.
export const callOutcomes = {
  no_answer: { label: "No answer", next: "Try again tomorrow" },
  voicemail: { label: "Left voicemail", next: "Try again in 2 days" },
  interested_send_link: { label: "Interested, text the demo", next: "Demo link sent, follow up in 2 days" },
  wants_payment_link: { label: "Wants to start", next: "Payment link sent" },
  call_back_later: { label: "Call back Thursday", next: "Reminder set" },
  not_interested: { label: "Not interested", next: "Removed from the list" },
  wrong_number: { label: "Wrong number", next: "Marked lost" },
} as const;
export type CallOutcome = keyof typeof callOutcomes;
