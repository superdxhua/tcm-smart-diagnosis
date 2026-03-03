import { useState } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { Network } from '@/network';
import './index.scss';

interface MedicalCase {
  id: string;
  doctor_name: string;
  doctor_era?: string;
  patient_gender?: string;
  patient_age?: number;
  main_symptoms: string;
  current_illness?: string;
  past_history?: string;
  tongue?: string;
  pulse?: string;
  diagnosis: string;
  prescription_name?: string;
  prescription_composition?: string;
  prescription_dosage?: string;
  prescription_usage?: string;
  treatment_result?: string;
  notes?: string;
  source?: string;
  tags?: string[];
  symptom_keywords?: string[];
  diagnosis_pattern?: string;
  effectiveness_score?: number;
  created_at: string;
}

export default function MedicalCasesPage() {
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctors, setDoctors] = useState<{ doctor_name: string; doctor_era?: string }[]>([]);
  const [tableNotFound, setTableNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useLoad(() => {
    loadCases();
    loadDoctors();
  });

  const loadCases = async () => {
    setLoading(true);
    setTableNotFound(false);
    setErrorMessage('');
    try {
      const res = await Network.request({
        url: '/api/medical-cases',
        data: {
          search: searchKeyword || undefined,
          doctorName: selectedDoctor || undefined,
        },
      });
      console.log('医案列表响应:', res);
      console.log('医案列表数据:', res.data);

      // 防御性编程：检查数据结构
      if (!res.data || !res.data.data) {
        console.warn('医案列表返回数据格式异常:', res);
        setCases([]);
        return;
      }

      setCases(res.data.data.list || []);
    } catch (error: any) {
      console.error('加载医案失败:', error);
      console.error('加载医案失败详细信息:', JSON.stringify(error));

      // 检查错误类型
      if (error.statusCode === 500) {
        // 500 错误：可能是表不存在或其他服务器错误
        setTableNotFound(true);
        setErrorMessage('服务器错误，可能是医案表未初始化');
      } else if (error.message && (error.message.includes('medical_cases') || error.message.includes('schema cache'))) {
        // 表不存在错误
        setTableNotFound(true);
        setErrorMessage('医案表未初始化，请先在 Supabase 控制台创建表');
      } else {
        // 其他错误
        setErrorMessage(error.message || '加载失败');
      }

      Taro.showToast({ title: errorMessage || error.message || '加载失败', icon: 'none' });
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await Network.request({
        url: '/api/medical-cases/doctors/list',
      });
      console.log('医生列表响应:', res);
      console.log('医生列表数据:', res.data);

      // 防御性编程：检查数据结构
      if (!res.data || !res.data.data) {
        console.warn('医生列表返回数据格式异常:', res);
        setDoctors([]);
        return;
      }

      setDoctors(res.data.data || []);
    } catch (error: any) {
      console.error('加载医生列表失败:', error);
      setDoctors([]);
    }
  };

  const handleSearch = () => {
    loadCases();
  };

  const handleAnalyzeCase = async (caseId: string) => {
    try {
      Taro.showLoading({ title: '分析中...' });
      await Network.request({
        url: `/api/medical-cases/${caseId}/analyze`,
        method: 'POST',
      });
      Taro.hideLoading();
      Taro.showToast({ title: '分析完成', icon: 'success' });
      loadCases();
    } catch (error) {
      Taro.hideLoading();
      console.error('分析失败:', error);
      Taro.showToast({ title: '分析失败', icon: 'none' });
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个医案吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/medical-cases/${caseId}`,
              method: 'DELETE',
            });
            Taro.showToast({ title: '删除成功', icon: 'success' });
            loadCases();
          } catch (error) {
            console.error('删除失败:', error);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      },
    });
  };

  const handleMatchSimilar = async (caseId: string) => {
    try {
      const selectedCaseData = cases.find((c) => c.id === caseId);
      if (!selectedCaseData) return;

      Taro.showLoading({ title: '匹配中...' });
      const res = await Network.request({
        url: '/api/medical-cases/match',
        method: 'POST',
        data: {
          symptoms: selectedCaseData.main_symptoms,
          tongue: selectedCaseData.tongue,
          pulse: selectedCaseData.pulse,
          limit: 5,
        },
      });
      Taro.hideLoading();

      if (res.data.data && res.data.data.cases && res.data.data.cases.length > 0) {
        // 这里可以显示相似医案列表
        Taro.showToast({ title: `找到${res.data.data.cases.length}个相似医案`, icon: 'success' });
      } else {
        Taro.showToast({ title: '未找到相似医案', icon: 'none' });
      }
    } catch (error) {
      Taro.hideLoading();
      console.error('匹配失败:', error);
      Taro.showToast({ title: '匹配失败', icon: 'none' });
    }
  };

  return (
    <View className="medical-cases-page min-h-screen bg-gray-100">
      {/* 返回按钮 */}
      <View className="bg-white px-4 py-3 flex items-center border-b border-gray-200">
        <View 
          className="flex items-center"
          onClick={() => Taro.navigateBack()}
        >
          <Text className="block text-2xl mr-2">←</Text>
          <Text className="block text-base font-medium text-gray-800">返回</Text>
        </View>
      </View>

      <View className="header p-4">
        <Text className="block text-2xl font-bold text-center mb-4">经方医案库</Text>
        
        <View className="search-bar mb-4">
          <View className="bg-gray-100 rounded-lg px-4 py-3 flex flex-row items-center">
            <Input
              className="flex-1 bg-transparent"
              placeholder="搜索医案（症状、诊断、方名）"
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
            />
            <Button
              className="ml-2 bg-blue-500 text-white text-sm"
              onClick={handleSearch}
            >
              搜索
            </Button>
          </View>
        </View>

        {doctors.length > 0 && (
          <View className="doctor-filter mb-4">
            <Text className="block text-sm mb-2">按医生筛选：</Text>
            <View className="flex flex-wrap gap-2">
              <Button
                size="mini"
                className={!selectedDoctor ? 'bg-blue-500 text-white' : 'bg-gray-200'}
                onClick={() => {
                  setSelectedDoctor('');
                  loadCases();
                }}
              >
                全部
              </Button>
              {doctors.map((doctor, index) => (
                <Button
                  key={index}
                  size="mini"
                  className={selectedDoctor === doctor.doctor_name ? 'bg-blue-500 text-white' : 'bg-gray-200'}
                  onClick={() => {
                    setSelectedDoctor(doctor.doctor_name);
                    loadCases();
                  }}
                >
                  {doctor.doctor_name}
                </Button>
              ))}
            </View>
          </View>
        )}
      </View>

      <ScrollView scrollY className="cases-list">
        {loading ? (
          <View className="loading text-center py-8">
            <Text className="block text-gray-500">加载中...</Text>
          </View>
        ) : tableNotFound ? (
          <View className="error-hint bg-red-50 rounded-lg p-4 m-4">
            <Text className="block text-red-600 font-bold mb-2">⚠️ 医案表未初始化</Text>
            <Text className="block text-sm text-gray-700 mb-3">
              需要在 Supabase 数据库中创建医案表，请按以下步骤操作：
            </Text>
            <View className="text-sm text-gray-700 space-y-2">
              <Text className="block">1. 登录 Supabase 控制台</Text>
              <Text className="block">2. 选择你的项目</Text>
              <Text className="block">3. 点击 &quot;SQL Editor&quot;</Text>
              <Text className="block">4. 执行 docs/SUPABASE_SETUP.md 中的 SQL 脚本</Text>
              <Text className="block">5. 刷新此页面</Text>
            </View>
            <View className="mt-4">
              <Button
                className="bg-blue-500 text-white"
                onClick={() => loadCases()}
              >
                重试
              </Button>
            </View>
          </View>
        ) : cases.length === 0 ? (
          <View className="empty text-center py-8">
            <Text className="block text-gray-500">暂无医案数据</Text>
          </View>
        ) : (
          cases.map((item) => (
            <View key={item.id} className="case-card bg-white rounded-lg p-4 mb-3 shadow-sm">
              <View className="case-header mb-3 pb-3 border-b border-gray-200">
                <Text className="block text-lg font-bold">{item.prescription_name || '未记录方名'}</Text>
                <View className="flex items-center justify-between mt-2">
                  <Text className="block text-sm text-gray-600">
                    {item.doctor_name} {item.doctor_era ? `(${item.doctor_era})` : ''}
                  </Text>
                  {item.effectiveness_score && (
                    <Text className="block text-sm text-green-600">
                      有效率: {(item.effectiveness_score * 100).toFixed(0)}%
                    </Text>
                  )}
                </View>
              </View>

              <View className="case-body mb-3">
                <Text className="block text-sm font-semibold mb-1">主诉：</Text>
                <Text className="block text-sm text-gray-700 mb-2">{item.main_symptoms}</Text>

                {item.diagnosis && (
                  <>
                    <Text className="block text-sm font-semibold mb-1">诊断：</Text>
                    <Text className="block text-sm text-gray-700 mb-2">{item.diagnosis}</Text>
                  </>
                )}

                {item.prescription_composition && (
                  <>
                    <Text className="block text-sm font-semibold mb-1">组成：</Text>
                    <Text className="block text-sm text-gray-700 mb-2">{item.prescription_composition}</Text>
                  </>
                )}

                {item.treatment_result && (
                  <>
                    <Text className="block text-sm font-semibold mb-1">治疗结果：</Text>
                    <Text className="block text-sm text-gray-700">{item.treatment_result}</Text>
                  </>
                )}
              </View>

              {item.tags && item.tags.length > 0 && (
                <View className="tags mb-3 flex flex-wrap gap-1">
                  {item.tags.map((tag, tagIndex) => (
                    <View key={tagIndex} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      <Text className="block">{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View className="case-actions flex gap-2">
                <Button
                  size="mini"
                  className="flex-1 bg-purple-500 text-white"
                  onClick={() => handleAnalyzeCase(item.id)}
                >
                  AI分析
                </Button>
                <Button
                  size="mini"
                  className="flex-1 bg-orange-500 text-white"
                  onClick={() => handleMatchSimilar(item.id)}
                >
                  匹配相似
                </Button>
                <Button
                  size="mini"
                  className="flex-1 bg-red-500 text-white"
                  onClick={() => handleDeleteCase(item.id)}
                >
                  删除
                </Button>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
