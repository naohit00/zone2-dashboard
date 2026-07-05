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
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    const load = async () => {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      setData(json ? JSON.parse(json) : {});
    };
    load();
  }, []);

  const getValue = (key: string) => data[key] || 0;

  // 月移動
  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // 🔥 強度 + 色
  const getBar = (value: number) => {
    if (value >= 40) return { symbol: "█", color: "#111" };       // 強
    if (value >= 30) return { symbol: "▆", color: "#ff8c00" };    // 中（オレンジ）
    if (value >= 20) return { symbol: "▂", color: "#1e90ff" };    // 軽（青）
    return { symbol: "○", color: "#ccc" };                        // 未実施
  };

  const renderDays = () => {
    const days = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const key = formatKey(date);
      const value = getValue(key);

      const bar = getBar(value);
      const isToday = formatKey(new Date()) === key;

      days.push(
        <Pressable
          key={key}
          onPress={() => setSelectedDate(key)}
          style={{
            width: "14%",
            aspectRatio: 1,
            margin: 3,
            borderRadius: 8,
            backgroundColor: "#fff",
            borderWidth: isToday ? 2 : 1,
            borderColor: isToday ? "#000" : "#eee",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* 日付 */}
          <Text style={{ fontSize: 10, color: "#333" }}>
            {i}
          </Text>

          {/* バー（記号＋色） */}
          <Text
            style={{
              fontSize: 18,
              color: bar.color,
              lineHeight: 18,
              marginTop: 2,
            }}
          >
            {bar.symbol}
          </Text>
        </Pressable>
      );
    }

    return days;
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
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {renderDays()}
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