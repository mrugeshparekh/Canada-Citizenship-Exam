export type OptionKey = "A" | "B" | "C" | "D";

export interface Question {
  question_number: number;
  question: string;
  options: Record<OptionKey, string>;
  answer: OptionKey;
}
