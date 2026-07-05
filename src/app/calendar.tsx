import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const STORAGE_KEY = "zone2_data";

const formatKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function CalendarScreen() {
  const [data, setData] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const weekLabels = ["月", "火", "水", "木", "金", "土", "日"];

  const load = async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    setData(json ? JSON.parse(json) : {});
  };

  useEffect(() => {
    load();
  }, [currentDate]);

  const getValue = (key: string) => data[key] || 0;

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const getBar = (value: number) => {
    if (value >= 40) return { symbol: "█", color: "#111" };
    if (value >= 30) return { symbol: "▆", color: "#ff8c00" };
    if (value >= 20) return { symbol: "▂", color: "#1e90ff" };
    return { symbol: "○", color: "#ccc" };
  };

  const startOfMonth = new Date(year, month, 1);
  const startDay = (startOfMonth.getDay() + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { date: Date; key: string; inMonth: boolean }[] = [];

  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    cells.push({ date: d, key: formatKey(d), inMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    cells.push({ date: d, key: formatKey(d), inMonth: true });
  }

  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, key: formatKey(d), inMonth: false });
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ padding: 20 }}>

        {/* ヘッダー */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ textAlign: "center", fontSize: 18, fontWeight: "bold" }}>

            {"　　　"}

            <Text onPress={prevMonth} style={{ fontSize: 22 }}>
              ＜
            </Text>

            {"　　"}

            {year}.{month + 1}

            {"　　"}

            <Text onPress={nextMonth} style={{ fontSize: 22 }}>
              ＞
            </Text>

            {"　　　　"}

            <Text
              onPress={goToday}
              style={{
                color: "#2563eb",
                fontWeight: "bold",
              }}
            >
              今日
            </Text>

          </Text>
        </View>

        {/* 曜日 */}
        <View style={{ flexDirection: "row", marginBottom: 6 }}>
          {weekLabels.map(w => (
            <Text
              key={w}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 12,
                color: "#666",
              }}
            >
              {w}
            </Text>
          ))}
        </View>

        {/* カレンダー（7列固定） */}
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {cells.map(cell => {
            const value = getValue(cell.key);
            const bar = getBar(value);
            const isToday = formatKey(new Date()) === cell.key;

            return (
              <Pressable
                key={cell.key}
                onPress={() => setSelectedDate(cell.key)}
                style={{
                  width: "14.28%",
                  aspectRatio: 1,
                  borderWidth: isToday ? 2 : 1,
                  borderColor: isToday ? "#000" : "#eee",
                  backgroundColor: cell.inMonth ? "#fff" : "#f0f0f0",
                  justifyContent: "center",
                  alignItems: "center",

                  borderRadius: 10, // ←ここ追加（角丸）
                }}
              >
                <Text style={{ fontSize: 10 }}>{cell.date.getDate()}</Text>
                <Text style={{ fontSize: 18, color: bar.color }}>
                  {bar.symbol}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 詳細 */}
        {selectedDate && (
          <View
            style={{
              marginTop: 20,
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#666" }}>{selectedDate}</Text>
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>
              {data[selectedDate] || 0} 分
            </Text>
          </View>
        )}

      </View>
    </ScrollView>
  );
}