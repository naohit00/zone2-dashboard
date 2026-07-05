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

// 月曜始まり
const WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function CalendarScreen() {
  const [data, setData] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const load = async () => {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      setData(json ? JSON.parse(json) : {});
    };
    load();
  }, [currentDate]);

  const getValue = (key: string) => data[key] || 0;

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getBar = (value: number) => {
    if (value >= 40) return { symbol: "█", color: "#111" };
    if (value >= 30) return { symbol: "▆", color: "#ff8c00" };
    if (value >= 20) return { symbol: "▂", color: "#1e90ff" };
    return { symbol: "○", color: "#ccc" };
  };

  // 月曜始まりの開始日
  const getStartDate = () => {
    const first = new Date(year, month, 1);
    const day = first.getDay(); // 0=日
    const diff = (day + 6) % 7; // 月曜基準
    const start = new Date(first);
    start.setDate(first.getDate() - diff);
    return start;
  };

  const renderCalendar = () => {
    const start = getStartDate();

    // 42日分生成
    const cells: any[] = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const key = formatKey(date);
      const value = getValue(key);
      const bar = getBar(value);

      const isToday = formatKey(new Date()) === key;
      const isCurrentMonth = date.getMonth() === month;

      cells.push({
        key,
        date,
        value,
        bar,
        isToday,
        isCurrentMonth,
      });
    }

    // 7個ずつに分割
    const rows: any[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }

    return (
      <View>
        {/* 曜日 */}
        <View style={{ flexDirection: "row", marginBottom: 6 }}>
          {WEEK.map(w => (
            <View key={w} style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 12, color: "#888" }}>{w}</Text>
            </View>
          ))}
        </View>

        {/* 本体（7列固定） */}
        {rows.map((row, idx) => (
          <View key={idx} style={{ flexDirection: "row" }}>
            {row.map(item => (
              <Pressable
                key={item.key}
                onPress={() => setSelectedDate(item.key)}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  margin: 2,
                  borderRadius: 8,
                  backgroundColor: item.isCurrentMonth ? "#fff" : "#f3f3f3",
                  borderWidth: item.isToday ? 2 : 1,
                  borderColor: item.isToday ? "#000" : "#eee",
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: item.isCurrentMonth ? 1 : 0.35,
                }}
              >
                <Text style={{ fontSize: 10 }}>
                  {item.date.getDate()}
                </Text>

                <Text
                  style={{
                    fontSize: 18,
                    color: item.bar.color,
                  }}
                >
                  {item.bar.symbol}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ padding: 20 }}>

        {/* タイトル */}
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
          カレンダー
        </Text>

        {/* 月切替 */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10,
            alignItems: "center",
          }}
        >
          <Pressable onPress={prevMonth}>
            <Text style={{ fontSize: 24 }}>＜</Text>
          </Pressable>

          <Text style={{ fontSize: 16, color: "#666" }}>
            {year}.{month + 1}
          </Text>

          <Pressable onPress={nextMonth}>
            <Text style={{ fontSize: 24 }}>＞</Text>
          </Pressable>
        </View>

        {/* カレンダー */}
        {renderCalendar()}

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
            <Text style={{ fontSize: 14, color: "#666" }}>
              {selectedDate}
            </Text>

            <Text style={{ fontSize: 22, fontWeight: "bold" }}>
              {data[selectedDate] || 0} 分
            </Text>
          </View>
        )}

      </View>
    </ScrollView>
  );
}