import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const STORAGE_KEY = "zone2_data";

const formatKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function HomeScreen() {
  const [data, setData] = useState<Record<string, any>>({});
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [memo, setMemo] = useState("");

  const [summary, setSummary] = useState({
    monthTotal: 0,
    yearTotal: 0,
    activeDays: 0,
  });

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const week = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    return {
      key: formatKey(date),
      label: `${y}.${m}.${d} ${week[date.getDay()]}`,
    };
  };

  const dateInfo = formatDate(currentDate);

  const calcSummary = (obj: Record<string, any>) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    let monthTotal = 0;
    let yearTotal = 0;
    let activeDays = 0;

    Object.entries(obj).forEach(([key, value]) => {
      const d = new Date(key);

      const minutes =
        typeof value === "number"
          ? value
          : value?.minutes ?? 0;

      if (d.getFullYear() === year) {
        yearTotal += minutes;
      }

      if (d.getFullYear() === year && d.getMonth() === month) {
        monthTotal += minutes;
        activeDays += 1;
      }
    });

    return { monthTotal, yearTotal, activeDays };
  };

  const reload = async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const obj = json ? JSON.parse(json) : {};

    setData(obj);
    setSummary(calcSummary(obj));

    setMemo(obj?.[dateInfo.key]?.memo ?? "");
    setSelectedMinutes(obj?.[dateInfo.key]?.minutes ?? null);
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    const value = data[dateInfo.key];

    if (!value) {
      setSelectedMinutes(null);
      setMemo("");
    } else {
      setSelectedMinutes(value.minutes ?? null);
      setMemo(value.memo ?? "");
    }
  }, [currentDate, data]);

  const changeDay = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    setCurrentDate(d);
  };

  const save = async () => {
    if (selectedMinutes === null) {
      Alert.alert("未選択", "時間を選択してください");
      return;
    }

    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const obj = json ? JSON.parse(json) : {};

    obj[dateInfo.key] = {
      minutes: selectedMinutes,
      memo,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(obj));

    await reload();

    Alert.alert("保存完了", "登録しました");
  };

  const exists =
    data[dateInfo.key] !== undefined &&
    data[dateInfo.key] !== 0;

  const isChanged =
    exists && data[dateInfo.key]?.minutes !== selectedMinutes;

  const statusText = !exists
    ? "未登録"
    : isChanged
    ? "変更あり（未保存）"
    : "登録済み";

  const statusColor = !exists
    ? "#999"
    : isChanged
    ? "#f59e0b"
    : "#16a34a";

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
        <View style={{ padding: 24 }}>

          {/* 日付 */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
            <Pressable onPress={() => changeDay(-1)}>
              <Text style={{ fontSize: 22 }}>＜</Text>
            </Pressable>

            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {dateInfo.label}
            </Text>

            <Pressable onPress={() => changeDay(1)}>
              <Text style={{ fontSize: 22 }}>＞
              </Text>
            </Pressable>
          </View>

          {/* ステータス */}
          <View style={{
            alignSelf: "flex-start",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: statusColor,
            marginBottom: 12,
          }}>
            <Text style={{ color: "white", fontSize: 12 }}>
              {statusText}
            </Text>
          </View>

          {/* 選択 */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            {[20, 30, 40].map((min) => {
              const selected = selectedMinutes === min;

              return (
                <Pressable
                  key={min}
                  onPress={() => setSelectedMinutes(min)}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: "center",
                    backgroundColor: selected ? "#111" : "#ddd",
                  }}
                >
                  <Text style={{ color: selected ? "white" : "black" }}>
                    +{min}分
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Memo */}
          <View style={{ marginBottom: 16 }}>
            <TextInput
              value={memo}
              onChangeText={setMemo}
              placeholder="メモ"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{
                backgroundColor: "white",
                padding: 12,
                borderRadius: 10,
                height: 80,
              }}
            />
          </View>

          {/* 保存 */}
          <Pressable
            onPress={save}
            style={{
              backgroundColor: selectedMinutes === null ? "#888" : "#111",
              padding: 18,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>
              {exists ? "変更して保存" : "登録する"}
            </Text>
          </Pressable>

          {/* 集計 */}
          <View style={{
            marginTop: 20,
            backgroundColor: "white",
            padding: 16,
            borderRadius: 12,
          }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              今月合計：{summary.monthTotal} 分
            </Text>

            <Text style={{ fontSize: 16 }}>
              実施日数：{summary.activeDays} 日
            </Text>

            {/* ここだけ横並び */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 16 }}>
                今年合計：{summary.yearTotal} 分
              </Text>

              <Text style={{
                fontSize: 11,
                color: "#888",
                marginLeft: 8,
              }}>
                ※ 1分 ≒ 体脂肪1g減（超概算）
              </Text>
            </View>

          </View>

        </View>
      </ScrollView>
    </View>
  );
}