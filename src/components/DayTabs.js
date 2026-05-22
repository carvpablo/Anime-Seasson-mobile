import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radius, typography } from '../constants/theme';
import { SCHEDULE_DAYS } from '../constants/api';
import { getCurrentDay } from '../utils/seasonHelpers';

const DayTabs = ({ selectedDay, onDayChange }) => {
  const scrollRef = useRef(null);
  const today = getCurrentDay();

  // Auto-scroll to selected tab
  useEffect(() => {
    const index = SCHEDULE_DAYS.findIndex((d) => d.key === selectedDay);
    if (scrollRef.current && index >= 0) {
      scrollRef.current.scrollTo({ x: index * 72, animated: true });
    }
  }, [selectedDay]);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {SCHEDULE_DAYS.map((day) => {
          const isSelected = day.key === selectedDay;
          const isToday = day.key === today;

          return (
            <TouchableOpacity
              key={day.key}
              onPress={() => onDayChange(day.key)}
              style={[
                styles.tab,
                isSelected && styles.tabSelected,
              ]}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}>
                {day.label}
              </Text>
              {isToday && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    width: 60,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: 'transparent',
    gap: 4,
  },
  tabSelected: {
    backgroundColor: colors.accent,
    ...{
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 6,
    },
  },
  tabLabel: {
    ...typography.h4,
    color: colors.textSecondary,
  },
  tabLabelSelected: {
    color: '#fff',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  dotSelected: {
    backgroundColor: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
});

export default DayTabs;
