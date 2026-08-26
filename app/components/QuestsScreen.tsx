"use client";

import { Swords, Trophy, Zap, Target, Flame, Check, Clock3 } from "lucide-react";

const iconFor = (metric: string) =>
  metric === "matches_played" ? <Swords size={17} /> :
  metric === "matches_won" ? <Trophy size={17} /> :
  metric === "elo_gained" ? <Zap size={17} /> :
  metric === "kills" ? <Target size={17} /> :
  metric === "win_streak" ? <Flame size={17} /> :
  <Swords size={17} />;

const dailyQuests = [
  { id: "daily_matches_played", metric: "matches_played", title: "Отыграть 3 матча", progress: 2, target: 3 },
  { id: "daily_matches_won", metric: "matches_won", title: "Выиграть 2 матча", progress: 2, target: 2, done: true },
  { id: "daily_elo_gained", metric: "elo_gained", title: "Набрать 25 ELO", progress: 10, target: 25 },
];

const weeklyQuests = [
  { id: "weekly_matches_played", metric: "matches_played", title: "Отыграть 12 матчей", progress: 7, target: 12, reward: "+12ч VIP" },
  { id: "weekly_matches_won", metric: "matches_won", title: "Выиграть 6 матчей", progress: 6, target: 6, reward: "+12ч VIP", done: true },
  { id: "weekly_kills", metric: "kills", title: "Набрать 70 убийств", progress: 41, target: 70, reward: "+12ч VIP" },
  { id: "weekly_elo_gained", metric: "elo_gained", title: "Набрать 80 ELO", progress: 35, target: 80, reward: "+12ч VIP" },
  { id: "weekly_win_streak", metric: "win_streak", title: "Выиграть 3 матча подряд", progress: 1, target: 3, reward: "+12ч VIP" },
];

const dailyDone = dailyQuests.filter((q) => q.done).length;
const dailyBonusReady = dailyDone === dailyQuests.length;

export default function QuestsScreen() {
  return (
    <>
      <h1 className="brand-title reveal">Задания</h1>

      <div className="section-title reveal" style={{ animationDelay: "0.02s", marginTop: 0 }}>
        Ежедневные
      </div>
      <div className="notice-pill reveal" style={{ animationDelay: "0.03s" }}>
        <Clock3 size={14} />
        Сброс через 16ч 42м · награда за все сразу: +5ч VIP
      </div>

      {dailyQuests.map((q, i) => (
        <QuestCard key={q.id} q={q} delay={0.05 + i * 0.05} />
      ))}

      <div className="section-title reveal" style={{ animationDelay: "0.24s" }}>
        Еженедельные
      </div>
      <div className="notice-pill reveal" style={{ animationDelay: "0.25s" }}>
        <Clock3 size={14} />
        Сброс через 3д 16ч · награда за каждое: +12ч VIP
      </div>

      {weeklyQuests.map((q, i) => (
        <QuestCard key={q.id} q={q} delay={0.27 + i * 0.05} />
      ))}

      <div className="footer reveal" style={{ animationDelay: "0.55s" }}>
        {dailyBonusReady ? "Дневная награда готова к получению" : "Выполни все ежедневные задания, чтобы забрать награду"}
      </div>
    </>
  );
}

function QuestCard({
  q,
  delay,
}: {
  q: { id: string; metric: string; title: string; progress: number; target: number; reward?: string; done?: boolean };
  delay: number;
}) {
  const done = q.done ?? q.progress >= q.target;
  const pct = Math.max(0, Math.min(100, (q.progress / q.target) * 100));
  return (
    <section className="card quest-item reveal" style={{ animationDelay: `${delay}s` }}>
      <span className={`quest-icon ${done ? "done" : ""}`}>{done ? <Check size={17} /> : iconFor(q.metric)}</span>
      <div className="quest-body">
        <div className="quest-title">{q.title}</div>
        <div className="quest-sub tabular">
          {done ? "Выполнено" : `${Math.min(q.progress, q.target)} / ${q.target}`}
        </div>
        <div className="quest-progress-track">
          <span className="quest-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {q.reward && <span className="quest-reward">{q.reward}</span>}
    </section>
  );
}
