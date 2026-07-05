import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const STORAGE_KEY = "zone2_data";

const formatKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function CalendarScreen() {
  const [data, setData] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const weekLabels = ["月", "火", "水", "木", "金", "土", "日"];

  const load = useCallback(async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    setData(json ? JSON.parse(json) : {});
  }, []);

  // ✅ タブ復帰時に必ず最新化
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const getValue = (key: string) => {
    const v = data[key];
    if (!v) return 0;
    if (typeof v === "number") return v;
    return v?.minutes ?? 0;
  };

  const getMemo = (key: string) => {
    const v = data[key];
    if (v && typeof v === "object") return v.memo ?? "";
    return "";
  };

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
    if (value >= 40) return { symbol: "█", color: "#7C3AED" };
    if (value >= 30) return { symbol: "▆", color: "#2563EB" };
    if (value >= 20) return { symbol: "▂", color: "#10B981" };
    return { symbol: "○", color: "#CBD5E1" };
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

  const todayKey = formatKey(new Date());

  const monthTotal = Object.entries(data).reduce((sum, [key, value]) => {
    const d = new Date(key);
    if (d.getFullYear() === year && d.getMonth() === month) {
      return sum + (typeof value === "number" ? value : value?.minutes ?? 0);
    }
    return sum;
  }, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ padding: 20 }}>

        {/* ヘッダー */}
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}>
          <Pressable onPress={prevMonth}>
            <Text style={{ fontSize: 22 }}>＜</Text>
          </Pressable>

          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {year}.{month + 1}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable onPress={goToday} style={{ marginRight: 16 }}>
              <Text style={{ color: "#2563EB", fontWeight: "bold" }}>
                今日
              </Text>
            </Pressable>

            <Pressable onPress={nextMonth}>
              <Text style={{ fontSize: 22 }}>＞
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 曜日 */}
        <View style={{ flexDirection: "row", marginBottom: 6 }}>
          {weekLabels.map(w => (
            <Text key={w} style={{ flex: 1, textAlign: "center", fontSize: 12 }}>
              {w}
            </Text>
          ))}
        </View>

        {/* カレンダー */}
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {cells.map(cell => {
            const value = getValue(cell.key);
            const bar = getBar(value);

            const isToday = cell.key === todayKey;
            const isSelected = selectedDate === cell.key;

            return (
              <Pressable
                key={cell.key}
                onPress={() => setSelectedDate(cell.key)}
                style={{
                  width: "14.2857%",
                  aspectRatio: 1,
                  borderRadius: 10,
                  marginBottom: 2,
                  backgroundColor: isSelected
                    ? "#dbeafe"
                    : cell.inMonth
                    ? "#fff"
                    : "#f0f0f0",
                  borderWidth: isToday ? 2 : 1,
                  borderColor: isToday ? "#2563EB" : "#e5e5e5",
                  justifyContent: "center",
                  alignItems: "center",
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

        {/* 月合計 */}
        <View style={{
          marginTop: 12,
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "baseline",
        }}>
          <Text style={{ fontSize: 11, color: "#888", marginRight: 6 }}>
            {year}.{month + 1} 合計
          </Text>

          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            {monthTotal} 分
          </Text>
        </View>

        {/* 詳細 */}
        {selectedDate && (
          <View style={{
            marginTop: 20,
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 12,
          }}>
            <Text style={{ color: "#666" }}>{selectedDate}</Text>
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>
              {getValue(selectedDate)} 分
            </Text>
            <Text style={{ marginTop: 8 }}>
              {getMemo(selectedDate) || "メモなし"}
            </Text>
          </View>
        )}

      </View>
    </ScrollView>
  );
}