import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Share
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@cham_cong_pro_v1';

export default function App() {
  const now = new Date();
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [tab, setTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [status, setStatus] = useState('full');
  const [regularHours, setRegularHours] = useState('8');
  const [otHours, setOtHours] = useState('0');
  const [specialOtHours, setSpecialOtHours] = useState('0');
  const [note, setNote] = useState('');
  const [records, setRecords] = useState({});
  const [settings, setSettings] = useState({
    currency: 'VND',
    hourlyRate: 35000,
    standardHours: 8,
    otMultiplier: 1.5,
    specialMultiplier: 2.0,
    monthlyAllowance: 500000,
    deductionPercent: 0
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.records) setRecords(parsed.records);
        if (parsed.settings) setSettings(parsed.settings);
      }
    });
  }, []);

  const persist = async (nextRecords, nextSettings) => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ records: nextRecords, settings: nextSettings })
    );
  };

  const saveDay = () => {
    const next = {
      ...records,
      [selectedDate]: {
        dateStr: selectedDate,
        status,
        regularHours: Number(regularHours) || 0,
        otHours: Number(otHours) || 0,
        specialOtHours: Number(specialOtHours) || 0,
        note
      }
    };
    setRecords(next);
    persist(next, settings);
  };

  const formatMoney = (val) => {
    const num = Math.round(Number(val) || 0).toLocaleString('vi-VN');
    return settings.currency === 'KRW' ? `${num} ₩` : `${num} ₫`;
  };

  const monthPrefix = selectedDate.slice(0, 7);
  const monthKeys = Object.keys(records).filter((k) => k.startsWith(monthPrefix)).sort().reverse();

  let totalReg = 0;
  let totalOt = 0;
  let totalSp = 0;
  let workDays = 0;

  monthKeys.forEach((k) => {
    const r = records[k];
    if (r && r.status !== 'off') {
      workDays += r.status === 'half' ? 0.5 : 1;
      totalReg += Number(r.regularHours) || 0;
      totalOt += Number(r.otHours) || 0;
      totalSp += Number(r.specialOtHours) || 0;
    }
  });

  const gross =
    totalReg * settings.hourlyRate +
    totalOt * settings.hourlyRate * settings.otMultiplier +
    totalSp * settings.hourlyRate * settings.specialMultiplier +
    Number(settings.monthlyAllowance || 0);
  const net = gross * (1 - (Number(settings.deductionPercent) || 0) / 100);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chấm Công Pro</Text>
        <Text style={styles.headerSub}>Tháng {monthPrefix} • {workDays} công • {formatMoney(net)}</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 90 }}>
        {tab === 'today' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ghi công ngày ({selectedDate})</Text>
            <TextInput
              style={styles.input}
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholder="YYYY-MM-DD"
            />
            <View style={styles.row}>
              {['full', 'half', 'paid_leave', 'off'].map((st) => (
                <TouchableOpacity
                  key={st}
                  onPress={() => setStatus(st)}
                  style={[styles.chip, status === st && styles.chipActive]}
                >
                  <Text style={status === st ? styles.chipTextActive : styles.chipText}>
                    {st === 'full' ? 'Đủ công' : st === 'half' ? 'Nửa công' : st === 'paid_leave' ? 'Nghỉ phép' : 'Nghỉ'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Giờ hành chính</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={regularHours} onChangeText={setRegularHours} />
            <Text style={styles.label}>Giờ Tăng ca (OT 1.5x)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={otHours} onChangeText={setOtHours} />
            <Text style={styles.label}>Giờ Ca đêm / Lễ (2.0x)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={specialOtHours} onChangeText={setSpecialOtHours} />
            <Text style={styles.label}>Ghi chú</Text>
            <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="Ghi chú ca làm..." />

            <TouchableOpacity style={styles.primaryBtn} onPress={saveDay}>
              <Text style={styles.primaryBtnText}>Lưu chấm công</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'stats' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Bảng lương tạm tính ({monthPrefix})</Text>
            <Text style={styles.netAmount}>{formatMoney(net)}</Text>
            <Text style={styles.statLine}>• Tổng ngày công: {workDays} ngày ({totalReg}h HC)</Text>
            <Text style={styles.statLine}>• Tăng ca OT 1.5x: {totalOt} giờ</Text>
            <Text style={styles.statLine}>• Tăng ca 2.0x / Đêm: {totalSp} giờ</Text>
            <Text style={styles.statLine}>• Phụ cấp cố định: {formatMoney(settings.monthlyAllowance)}</Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() =>
                Share.share({
                  message: `Bảng công ${monthPrefix}: ${workDays} công, OT ${totalOt + totalSp}h, Thực lĩnh: ${formatMoney(net)}`
                })
              }
            >
              <Text style={styles.primaryBtnText}>Chia sẻ bảng lương</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'settings' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Cài đặt mức lương</Text>
            <View style={styles.row}>
              {['VND', 'KRW'].map((cur) => (
                <TouchableOpacity
                  key={cur}
                  onPress={() => {
                    const nextS = {
                      ...settings,
                      currency: cur,
                      hourlyRate: cur === 'KRW' ? 10030 : 35000,
                      monthlyAllowance: cur === 'KRW' ? 150000 : 500000
                    };
                    setSettings(nextS);
                    persist(records, nextS);
                  }}
                  style={[styles.chip, settings.currency === cur && styles.chipActive]}
                >
                  <Text style={settings.currency === cur ? styles.chipTextActive : styles.chipText}>{cur}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Lương 1 giờ</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(settings.hourlyRate)}
              onChangeText={(v) => {
                const nextS = { ...settings, hourlyRate: Number(v) || 0 };
                setSettings(nextS);
                persist(records, nextS);
              }}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => setTab('today')} style={styles.tabItem}>
          <Text style={tab === 'today' ? styles.tabActive : styles.tabInactive}>Chấm công</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('stats')} style={styles.tabItem}>
          <Text style={tab === 'stats' ? styles.tabActive : styles.tabInactive}>Bảng lương</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('settings')} style={styles.tabItem}>
          <Text style={tab === 'settings' ? styles.tabActive : styles.tabInactive}>Cài đặt</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#4f46e5', padding: 18, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  headerSub: { color: '#e0e7ff', fontSize: 13, marginTop: 4 },
  body: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 10, fontSize: 14 },
  row: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  chip: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center' },
  chipActive: { backgroundColor: '#eef2ff', borderColor: '#4f46e5' },
  chipText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  chipTextActive: { fontSize: 12, color: '#4f46e5', fontWeight: '700' },
  primaryBtn: { backgroundColor: '#4f46e5', borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  netAmount: { fontSize: 28, fontWeight: '800', color: '#059669', marginVertical: 8 },
  statLine: { fontSize: 13, color: '#334155', marginVertical: 3 },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e2e8f0', paddingVertical: 14 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabActive: { color: '#4f46e5', fontWeight: '700', fontSize: 13 },
  tabInactive: { color: '#94a3b8', fontWeight: '500', fontSize: 13 }
});
