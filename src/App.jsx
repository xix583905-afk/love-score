 import { useState, useEffect } from "react";
import { supabase } from "./supabase";
export default function App() {
  const rules = [
  { name: "🚻 上厕所未报备", score: -2 },
  { name: "📖 未背诵完母狗准则", score: -5 },
  { name: "💬 空闲时间2分钟内未回复信息", score: -5 },
  { name: "📍 15分钟未主动分享自身状态", score: -5 },
  { name: "❤️ 未随时做好给主人泄欲准备", score: -5 },
  { name: "🚪 未经报备同意擅自出门", score: -20 },
  { name: "📹 被要求报备时1分钟内未完成报备视频", score: -5 },
  { name: "🌅 早晚未请安加朗诵母狗准则", score: -5 },
];
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem("score");
    return saved ? Number(saved) : 100;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("history");
    return saved ? JSON.parse(saved) : [];
  });useEffect(() => {
  async function loadData() {
    const { data } = await supabase
      .from("score_data")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      setScore(data[0].score);

      setHistory(
        data.map(item => ({
          time: new Date(item.created_at).toLocaleString(),
          reason: item.reason,
          value: item.value ?? 0,
        }))
      );
    }
  }

  loadData();

  const channel = supabase
    .channel("score-realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "score_data",
      },
      payload => {
        const item = payload.new;

        setScore(item.score);

        setHistory(history => [
          {
            time: new Date(item.created_at).toLocaleString(),
            reason: item.reason,
            value: item.value ?? 0,
          },
          ...history,
        ]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  useEffect(() => {
    localStorage.setItem("score", score);
  }, [score]);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);
async function changeScore(value, reason) {
  const newScore = score + value;
  setScore(newScore);

  const record = {
    score: newScore,
    reason,
    created_at: new Date().toISOString(),
  };

  setHistory([
    {
      time: new Date().toLocaleString(),
      reason,
      value,
    },
    ...history,
  ]);

  const { data, error } = await supabase
    .from("score_data")
    .insert([record]);

  console.log(data);
  console.log(error);
}
 

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        display: "flex",
        justifyContent: "center",
        padding: 40,
      }}
    >
      <div
        style={{
          width: 430,
          background: "#1e293b",
          borderRadius: 25,
          padding: 30,
        }}
      >
        <h1 style={{ textAlign: "center" }}>
          母狗姗姗晋级系统
        </h1>

        <div
          style={{
            textAlign: "center",
            fontSize: 90,
            fontWeight: "bold",
            color: "#4ade80",
          }}
        >
          {score}
        </div>

        <h2 style={{ textAlign: "center" }}>
          当前等级：
          {score >= 100
            ? "🏆 优秀"
            : score >= 80
            ? "😊 良好"
            : score >= 60
            ? "😐 一般"
            : "⚠️ 注意"}
        </h2>
<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 30,
  }}
>
  {rules.map((item) => (
    <button
      key={item.name}
      onClick={() => changeScore(item.score, item.name)}
      style={{
        padding: 16,
        fontSize: 18,
        borderRadius: 12,
        cursor: "pointer",
        background: item.score > 0 ? "#22c55e" : "#ef4444",
        color: "white",
        border: "none",
      }}
    >
      {item.name}
      <br />
      {item.score > 0 ? "+" : ""}
      {item.score}
    </button>
  ))}
</div>
       

        <h2 style={{ marginTop: 40 }}>
          历史记录
        </h2>

        {history.length === 0 && (
          <p>暂无记录</p>
        )}

        {history.map((item, index) => (
          <div
            key={index}
            style={{
              background: "#334155",
              padding: 10,
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <b>{item.reason}</b>

            <div>
              {item.value > 0 ? "+" : ""}
              {item.value}
            </div>

            <small>{item.time}</small>
          </div>
        ))}
      </div>
    </div>
  );
}