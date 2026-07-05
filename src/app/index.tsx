import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const STORAGE_KEY = "zone2_data";

export default function HomeScreen() {
  const [data, setData] = useState<Record<string, number>>({});
  const [todayMinutes, setTodayMinutes] = useState(0);

  const [summary, setSummary] = useState({
    monthTotal: 0,
    yearTotal: 0,
    activeDays: 0,
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const DEBUG_YESTERDAY = false;

  // ----------------------------
  // 日付キー
  // ----------------------------
  const getDateKey = () => {
    const d = new Date();

    if (DEBUG_YESTERDAY) {
      d.setDate(d.getDate() - 1);
    }

    return d.toISOString().split("T")[0];
  };

  // ----------------------------
  // カレンダー日付生成
  // ----------------------------
  const getMonthDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: string[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push(d.toISOString().split("T")[0]);
    }

    return days;
  };

  // ----------------------------
  // 値取得
  // ----------------------------
  const getValueByDate = (date: string) => {
    return data[date] || 0;
  };

  // ----------------------------
  // 集計
  // ----------------------------
  const getSummary = (obj: Record<string, number>) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    let monthTotal = 0;
    let yearTotal = 0;
    let activeDays = 0;

    Object.entries(obj).forEach(([key, value]) => {
      const date = new Date(key);

      if (date.getFullYear() === year) {
        yearTotal += value;
      }

      if (date.getFullYear() === year && date.getMonth() === month) {
        monthTotal += value;
        activeDays += 1;
      }
    });

    return { monthTotal, yearTotal, activeDays };
  };

  // ----------------------------
  // 初期ロード
  // ----------------------------
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const obj = json ? JSON.parse(json) : {};

    setData(obj);

    const key = getDateKey();
    setTodayMinutes(obj[key] || 0);

    setSummary(getSummary(obj));
  };

  // ----------------------------
  // 保存
  // ----------------------------
  const saveData = async (newValue: number) => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const obj = json ? JSON.parse(json) : {};

    const key = getDateKey();
    obj[key] = newValue;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(obj));

    setData(obj);
    setSummary(getSummary(obj));
  };

  const addMinutes = (min: number) => {
    const newValue = todayMinutes + min;
    setTodayMinutes(newValue);
    saveData(newValue);
  };

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ padding: 24 }}>

        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
          Zone2 Dashboard
        </Text>

        {/* 今日 */}
        <View style={{ backgroundColor: "white", padding: 20, borderRadius: 12, marginBottom: 20 }}>
          <Text style={{ fontSize: 16, color: "gray" }}>
            {getDateKey()}
          </Text>

          <Text style={{ fontSize: 18 }}>今日の合計</Text>

          <Text style={{ fontSize: 32, fontWeight: "bold" }}>
            {todayMinutes} 分
          </Text>
        </View>

        {/* ダッシュボード */}
        <View style={{ backgroundColor: "white", padding: 20, borderRadius: 12, marginBottom: 20 }}>
          <Text>今月合計：{summary.monthTotal} 分</Text>
          <Text>実施日数：{summary.activeDays} 日</Text>
          <Text>今年合計：{summary.yearTotal} 分</Text>
        </View>

        {/* カレンダー */}
        <View style={{ backgroundColor: "white", padding: 16, borderRadius: 12, marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            今月カレンダー
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {getMonthDays().map((date) => {
              const value = getValueByDate(date);

              return (
                <Pressable
                  key={date}
                  onPress={() => setSelectedDate(date)}
                  style={{
                    width: "14%",
                    aspectRatio: 1,
                    margin: 2,
                    backgroundColor:
                      value === 0 ? "#eee" : value < 30 ? "#999" : "#222",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 10, color: "white" }}>
                    {new Date(date).getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 選択詳細 */}
        {selectedDate && (
          <View style={{ backgroundColor: "white", padding: 20, borderRadius: 12, marginBottom: 20 }}>
            <Text style={{ fontSize: 16, color: "gray" }}>
              {selectedDate}
            </Text>

            <Text style={{ fontSize: 22, fontWeight: "bold" }}>
              {data[selectedDate] || 0} 分
            </Text>
          </View>
        )}

        {/* ボタン */}
        <Pressable onPress={() => addMinutes(20)} style={{ backgroundColor: "#222", padding: 16, borderRadius: 10, marginBottom: 10 }}>
          <Text style={{ color: "white" }}>+20分</Text>
        </Pressable>

        <Pressable onPress={() => addMinutes(30)} style={{ backgroundColor: "#444", padding: 16, borderRadius: 10, marginBottom: 10 }}>
          <Text style={{ color: "white" }}>+30分</Text>
        </Pressable>

        <Pressable onPress={() => addMinutes(40)} style={{ backgroundColor: "#666", padding: 16, borderRadius: 10 }}>
          <Text style={{ color: "white" }}>+40分</Text>
        </Pressable>

      </View>
    </ScrollView>
  );
}