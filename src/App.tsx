import { useEffect, useMemo, useRef, useState } from "react";
import rawBank from "./data/questions.json";
import type { OptionKey, Question } from "./types";

const TOTAL_QUESTIONS = 20;
const PASS_PERCENT = 0.75;
const PASS_SCORE = Math.ceil(TOTAL_QUESTIONS * PASS_PERCENT); // 15
const EXAM_SECONDS = 45 * 60; // 45 minutes

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizeOptions(options: any): Record<OptionKey, string> {
  const out: Record<OptionKey, string> = { A: "", B: "", C: "", D: "" };
  if (options && typeof options === "object") {
    (["A", "B", "C", "D"] as OptionKey[]).forEach((k) => {
      if (options[k]) out[k] = String(options[k]).trim();
    });
  }
  return out;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function App() {
  const [attemptKey, setAttemptKey] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selected, setSelected] = useState<Record<number, OptionKey>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(EXAM_SECONDS);
  const timerRef = useRef<number | null>(null);

  const quiz: Question[] = useMemo(() => {
    const bank = (rawBank as any[])
      .filter((q) => q && q.question && q.options && q.answer)
      .map((q) => ({
        question_number: Number(q.question_number),
        question: String(q.question).trim(),
        options: normalizeOptions(q.options),
        answer: String(q.answer).trim().toUpperCase() as OptionKey,
      }))
      .filter((q) => (["A", "B", "C", "D"] as string[]).includes(q.answer));

    return shuffle(bank).slice(0, TOTAL_QUESTIONS);
  }, [attemptKey]);

  const answeredCount = useMemo(() => Object.keys(selected).length, [selected]);

  const progressPercent = useMemo(() => {
    return Math.round(((currentIndex + 1) / TOTAL_QUESTIONS) * 100);
  }, [currentIndex]);

  const canSubmit = answeredCount === TOTAL_QUESTIONS;

  const score = useMemo(() => {
    if (!submitted) return 0;
    let s = 0;
    for (let i = 0; i < quiz.length; i++) {
      if (selected[i] && selected[i] === quiz[i].answer) s += 1;
    }
    return s;
  }, [submitted, selected, quiz]);

  const passed = submitted && score >= PASS_SCORE;

  const pickOption = (opt: OptionKey) => {
    if (submitted) return;
    setSelected((prev) => ({ ...prev, [currentIndex]: opt }));
  };

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(TOTAL_QUESTIONS - 1, i + 1));

  const doSubmit = () => {
    setSubmitted(true);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const restart = () => {
    setAttemptKey((k) => k + 1);
    setCurrentIndex(0);
    setSelected({});
    setSubmitted(false);
    setTimeLeft(EXAM_SECONDS);
  };

  useEffect(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          queueMicrotask(() => doSubmit());
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptKey]);

  const current = quiz[currentIndex];

  if (!current) {
    return (
      <div className="container py-4">
        <h1 className="mb-3">Citizenship Practice Exam</h1>
        <div className="alert alert-danger">
          Could not load questions. Ensure <code>src/data/questions.json</code> exists and has valid entries.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
        <div>
          <h1 className="h3 mb-1">Citizenship Practice Exam</h1>
          <div className="text-secondary">
            Passing: <strong>{PASS_SCORE}/{TOTAL_QUESTIONS}</strong> (75%) • 1 point each • No negative marking
          </div>
        </div>

        <div className="d-flex gap-3 align-items-center">
          <div className="text-secondary">
            Answered: <strong>{answeredCount}/{TOTAL_QUESTIONS}</strong>
          </div>
          <div className={`badge ${timeLeft <= 60 ? "text-bg-danger" : "text-bg-primary"} fs-6`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="d-flex justify-content-between small text-secondary mb-1">
          <span>Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="progress" role="progressbar" aria-label="Quiz progress" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {!submitted ? (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="fw-semibold">
                Question {currentIndex + 1} / {TOTAL_QUESTIONS}{" "}
                <span className="text-secondary fw-normal">(Bank #{current.question_number})</span>
              </div>
            </div>

            <div className="fs-5 mb-3">{current.question}</div>

            <div className="d-grid gap-2">
              {(["A", "B", "C", "D"] as OptionKey[]).map((k) => {
                const text = current.options[k];
                const isSelected = selected[currentIndex] === k;
                const disabled = !text;

                return (
                  <button
                    key={k}
                    type="button"
                    className={`btn text-start ${isSelected ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => pickOption(k)}
                    disabled={disabled}
                  >
                    <span className="fw-bold me-2">{k}.</span>
                    {text || <span className="text-secondary">(missing option)</span>}
                  </button>
                );
              })}
            </div>

            <div className="d-flex justify-content-between gap-2 mt-4">
              <button className="btn btn-outline-secondary" onClick={prev} disabled={currentIndex === 0}>
                ← Previous
              </button>

              {currentIndex < TOTAL_QUESTIONS - 1 ? (
                <button className="btn btn-primary" onClick={next}>
                  Next →
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={doSubmit}
                  disabled={!canSubmit}
                  title={!canSubmit ? "Answer all questions to submit" : "Submit exam"}
                >
                  Submit Exam
                </button>
              )}
            </div>

            <div className="small text-secondary mt-3">
              Note: You must answer all {TOTAL_QUESTIONS} questions to submit. Exam auto-submits at 45:00.
            </div>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className={`h4 mb-2 ${passed ? "text-success" : "text-danger"}`}>
              {passed ? "✅ PASS" : "❌ FAIL"}
            </h2>
            <p className="mb-1">
              Score: <strong>{score}</strong> / {TOTAL_QUESTIONS} ({Math.round((score / TOTAL_QUESTIONS) * 100)}%)
            </p>
            <p className="text-secondary mb-4">
              Passing score: <strong>{PASS_SCORE}</strong> / {TOTAL_QUESTIONS} (75%)
            </p>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="h5 mb-0">Review</h3>
              <button className="btn btn-outline-primary btn-sm" onClick={restart}>
                New Random Exam
              </button>
            </div>

            <ol className="list-group list-group-numbered">
              {quiz.map((q, i) => {
                const pickedLetter = selected[i];
                const correctLetter = q.answer;

                const pickedText = pickedLetter ? q.options[pickedLetter] : "";
                const correctText = correctLetter ? q.options[correctLetter] : "";

                const ok = pickedLetter === correctLetter;

                return (
                  <li
                    key={`${q.question_number}-${i}`}
                    className={`list-group-item ${ok ? "list-group-item-success" : "list-group-item-danger"}`}
                  >
                    <div className="fw-semibold mb-1">{q.question}</div>
                    <div className="small">
                      <div>
                        Your answer: <strong>{pickedText || "-"}</strong>
                      </div>
                      {!ok && (
                        <div>
                          Correct answer: <strong>{correctText || "-"}</strong>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="small text-secondary mt-3">
              Tip: Use “New Random Exam” to practice another set of 20 questions.
            </div>
          </div>
        </div>
      )}

      <footer className="text-center text-secondary small mt-4">
        Built with React + TypeScript + Bootstrap • Random 20 questions per attempt • 45-minute timer
      </footer>
    </div>
  );
}
