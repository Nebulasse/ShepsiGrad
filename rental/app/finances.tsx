import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Dimensions
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { propertyService } from './services/propertyService';

import { FINANCE_MODULE, PRICING_CONFIG } from './moduleConfig';

// Типы для финансовых данных
interface Transaction {
  id: string;
  propertyId: string;
  propertyName: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'payout';
  category: string;
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayouts: number;
  currency: string;
  monthlyData: {
    month: string;
    income: number;
    expenses: number;
  }[];
  incomeByProperty: {
    propertyId: string;
    propertyName: string;
    amount: number;
  }[];
  expensesByCategory: {
    category: string;
    amount: number;
  }[];
}

interface RevenueData {
  month: string;
  amount: number;
}

interface BookingStats {
  total: number;
  completed: number;
  upcoming: number;
  cancelled: number;
}

interface PropertyRevenue {
  propertyId: string;
  propertyName: string;
  amount: number;
  color: string;
}

interface FinancialData {
  income: {
    monthly: number[];
    total: number;
  };
  expenses: {
    monthly: number[];
    total: number;
  };
  bookings: {
    monthly: number[];
    total: number;
  };
  occupancyRate: number;
  averageBookingValue: number;
  paymentMethods: {
    method: string;
    percentage: number;
    color: string;
  }[];
}

export default function FinancesScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'reports'>('overview');
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    total: 0,
    completed: 0,
    upcoming: 0,
    cancelled: 0
  });
  const [propertyRevenue, setPropertyRevenue] = useState<PropertyRevenue[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const screenWidth = Dimensions.get('window').width - 32;

  useEffect(() => {
    loadFinancialData();
  }, [dateRange]);

  const loadFinancialData = async () => {
    setLoading(true);
    
    try {
      // В реальном приложении здесь будет запрос к API
      // Используем демо-данные
      setTimeout(() => {
        // Генерируем данные в зависимости от выбранного периода
        const months = dateRange === 'month' ? 1 : dateRange === 'quarter' ? 3 : 12;
        
        const mockData: FinancialData = {
          income: {
            monthly: Array.from({ length: months }, () => Math.floor(Math.random() * 50000) + 20000),
            total: 0
          },
          expenses: {
            monthly: Array.from({ length: months }, () => Math.floor(Math.random() * 10000) + 5000),
            total: 0
          },
          bookings: {
            monthly: Array.from({ length: months }, () => Math.floor(Math.random() * 10) + 1),
            total: 0
          },
          occupancyRate: Math.floor(Math.random() * 40) + 60, // 60-100%
          averageBookingValue: Math.floor(Math.random() * 3000) + 2000,
          paymentMethods: [
            { method: 'Карта', percentage: 65, color: '#4D8EFF' },
            { method: 'СБП', percentage: 25, color: '#FF9500' },
            { method: 'Наличные', percentage: 10, color: '#4CAF50' }
          ]
        };
        
        // Рассчитываем итоговые значения
        mockData.income.total = mockData.income.monthly.reduce((a, b) => a + b, 0);
        mockData.expenses.total = mockData.expenses.monthly.reduce((a, b) => a + b, 0);
        mockData.bookings.total = mockData.bookings.monthly.reduce((a, b) => a + b, 0);
        
        setFinancialData(mockData);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Ошибка при загрузке финансовых данных:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const renderOverviewTab = () => {
    if (!financialData) return null;

    const chartConfig = {
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      color: (opacity = 1) => `rgba(77, 142, 255, ${opacity})`,
      strokeWidth: 2,
      decimalPlaces: 0,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16,
      },
    };

    const monthlyChartData = {
      labels: financialData.income.monthly.map((d, index) => {
        if (dateRange === 'month') {
          return 'Текущий месяц';
        } else if (dateRange === 'quarter') {
          return `Месяц ${index + 1}`;
        } else {
          return 'Янв';
        }
      }),
      datasets: [
        {
          data: financialData.income.monthly,
          color: (opacity = 1) => `rgba(77, 142, 255, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: financialData.expenses.monthly,
          color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['Доходы', 'Расходы'],
    };

    const propertyIncomeData = {
      labels: propertyRevenue.map(p => p.propertyName.split(' ')[0]),
      datasets: [
        {
          data: propertyRevenue.map(p => p.amount),
        },
      ],
    };

    const expensesPieData = financialData.expenses.monthly.map((item, index) => {
      const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA'];
      return {
        name: getCategoryName(financialData.expenses.monthly[index].toString()),
        amount: item,
        color: colors[index % colors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      };
    });

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Общий доход</Text>
            <Text style={[styles.summaryValue, styles.incomeText]}>
              {formatCurrency(financialData.income.total)}
            </Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Общие расходы</Text>
            <Text style={[styles.summaryValue, styles.expenseText]}>
              {formatCurrency(financialData.expenses.total)}
            </Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Чистая прибыль</Text>
            <Text style={[styles.summaryValue, styles.profitText]}>
              {formatCurrency(financialData.income.total - financialData.expenses.total)}
            </Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Доходы и расходы</Text>
          <View style={styles.dateRangeSelector}>
            {['month', 'quarter', 'year'].map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.dateRangeOption,
                  dateRange === range && styles.dateRangeOptionActive,
                ]}
                onPress={() => setDateRange(range as 'month' | 'quarter' | 'year')}
              >
                <Text
                  style={[
                    styles.dateRangeText,
                    dateRange === range && styles.dateRangeTextActive,
                  ]}
                >
                  {range === 'month' && 'Месяц'}
                  {range === 'quarter' && 'Квартал'}
                  {range === 'year' && 'Год'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <LineChart
            data={monthlyChartData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Доход по объектам</Text>
          <BarChart
            data={propertyIncomeData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            verticalLabelRotation={0}
            showValuesOnTopOfBars
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Расходы по категориям</Text>
          <PieChart
            data={expensesPieData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </ScrollView>
    );
  };

  const renderTransactionsTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        {transactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionHeader}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionProperty} numberOfLines={1}>
                  {transaction.propertyName}
                </Text>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.date)}
                </Text>
              </View>
              <View style={[
                styles.statusBadge, 
                transaction.status === 'completed' ? styles.statusCompleted : 
                transaction.status === 'pending' ? styles.statusPending : 
                styles.statusFailed
              ]}>
                <Text style={styles.statusText}>
                  {transaction.status === 'completed' ? 'Выполнено' : 
                   transaction.status === 'pending' ? 'В обработке' : 
                   'Ошибка'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.transactionDescription}>
              {transaction.description}
            </Text>
            
            <View style={styles.transactionFooter}>
              <View style={styles.transactionCategory}>
                <Ionicons 
                  name={getCategoryIcon(transaction.category)}
                  size={16} 
                  color="#666666" 
                />
                <Text style={styles.categoryText}>
                  {getCategoryName(transaction.category)}
                </Text>
              </View>
              
              <Text style={[
                styles.transactionAmount,
                transaction.type === 'income' ? styles.incomeText :
                transaction.type === 'expense' ? styles.expenseText :
                styles.payoutText
              ]}>
                {transaction.type === 'income' ? '+' :
                 transaction.type === 'expense' ? '-' : ''}
                {formatCurrency(transaction.amount)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderReportsTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Ionicons name="document-text-outline" size={24} color="#4D8EFF" />
            <Text style={styles.reportTitle}>Ежемесячный отчет</Text>
          </View>
          <Text style={styles.reportDescription}>
            Подробный отчет о доходах и расходах за текущий месяц
          </Text>
          <TouchableOpacity style={styles.downloadButton}>
            <Ionicons name="download-outline" size={20} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Скачать PDF</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Ionicons name="bar-chart-outline" size={24} color="#4D8EFF" />
            <Text style={styles.reportTitle}>Квартальный отчет</Text>
          </View>
          <Text style={styles.reportDescription}>
            Сводный отчет за последний квартал с аналитикой и графиками
          </Text>
          <TouchableOpacity style={styles.downloadButton}>
            <Ionicons name="download-outline" size={20} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Скачать PDF</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Ionicons name="receipt-outline" size={24} color="#4D8EFF" />
            <Text style={styles.reportTitle}>Налоговый отчет</Text>
          </View>
          <Text style={styles.reportDescription}>
            Отчет для налоговой декларации с учетом всех доходов и расходов
          </Text>
          <TouchableOpacity style={styles.downloadButton}>
            <Ionicons name="download-outline" size={20} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Скачать PDF</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Ionicons name="analytics-outline" size={24} color="#4D8EFF" />
            <Text style={styles.reportTitle}>Аналитический отчет</Text>
          </View>
          <Text style={styles.reportDescription}>
            Детальный анализ эффективности каждого объекта недвижимости
          </Text>
          <TouchableOpacity style={styles.downloadButton}>
            <Ionicons name="download-outline" size={20} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Скачать PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Вспомогательные функции
  const getCategoryName = (category: string): string => {
    switch (category) {
      case 'booking':
        return 'Бронирование';
      case 'cleaning':
        return 'Уборка';
      case 'maintenance':
        return 'Обслуживание';
      case 'utilities':
        return 'Коммунальные услуги';
      case 'payout':
        return 'Вывод средств';
      default:
        return 'Прочее';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'booking':
        return 'calendar-outline';
      case 'cleaning':
        return 'water-outline';
      case 'maintenance':
        return 'construct-outline';
      case 'utilities':
        return 'flash-outline';
      case 'payout':
        return 'cash-outline';
      default:
        return 'ellipsis-horizontal-outline';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen 
          options={{
            headerShown: true,
            title: 'Финансы',
            headerStyle: { backgroundColor: '#4D8EFF' },
            headerTintColor: '#fff',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4D8EFF" />
          <Text style={styles.loadingText}>Загрузка финансовых данных...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Финансы',
          headerStyle: { backgroundColor: '#4D8EFF' },
          headerTintColor: '#fff',
        }}
      />
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'overview' && styles.activeTabButton]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'overview' && styles.activeTabButtonText]}>
            Обзор
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'transactions' && styles.activeTabButton]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'transactions' && styles.activeTabButtonText]}>
            Транзакции
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'reports' && styles.activeTabButton]}
          onPress={() => setActiveTab('reports')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'reports' && styles.activeTabButtonText]}>
            Отчеты
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'transactions' && renderTransactionsTab()}
      {activeTab === 'reports' && renderReportsTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#4D8EFF',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabButtonText: {
    color: '#4D8EFF',
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#4CAF50',
  },
  expenseText: {
    color: '#F44336',
  },
  profitText: {
    color: '#4D8EFF',
  },
  payoutText: {
    color: '#FF9800',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  dateRangeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateRangeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  dateRangeOptionActive: {
    backgroundColor: '#4D8EFF',
  },
  dateRangeText: {
    fontSize: 14,
    color: '#666666',
  },
  dateRangeTextActive: {
    color: '#FFFFFF',
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionProperty: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusCompleted: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  statusPending: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  statusFailed: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
  },
  transactionCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: '#4D8EFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
}); 