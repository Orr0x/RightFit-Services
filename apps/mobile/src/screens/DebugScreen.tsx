import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Share, Text, TouchableOpacity } from 'react-native'
import logger, { LogEntry, LogLevel } from '../services/logger'
import { Button, Card, Spinner } from '../components/ui'
import { colors, spacing, typography, borderRadius } from '../styles/tokens'

export default function DebugScreen() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL')

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoading(true)
    try {
      await logger.init()
      const allLogs = await logger.getLogs()
      setLogs(allLogs.reverse()) // Show newest first
    } catch (error) {
      console.error('Failed to load logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearLogs = async () => {
    await logger.clearLogs()
    await loadLogs()
  }

  const handleExportLogs = async () => {
    try {
      const logsText = await logger.exportLogs()
      await Share.share({
        message: logsText,
        title: 'RightFit App Logs',
      })
    } catch (error) {
      console.error('Failed to export logs:', error)
    }
  }

  const filteredLogs = filter === 'ALL' ? logs : logs.filter((log) => log.level === filter)

  const getColorForLevel = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return '#f44336'
      case LogLevel.WARN:
        return '#ff9800'
      case LogLevel.INFO:
        return '#2196f3'
      case LogLevel.DEBUG:
        return '#9e9e9e'
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Spinner size="large" />
        <Text style={styles.loadingText}>Loading logs...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug Logs ({filteredLogs.length})</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setFilter('ALL')}
            style={[styles.filterChip, filter === 'ALL' && styles.filterChipSelected]}
          >
            <Text style={[styles.filterChipText, filter === 'ALL' && styles.filterChipTextSelected]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter(LogLevel.ERROR)}
            style={[
              styles.filterChip,
              filter === LogLevel.ERROR && { backgroundColor: '#f44336' }
            ]}
          >
            <Text style={[styles.filterChipText, filter === LogLevel.ERROR && { color: 'white' }]}>
              Errors
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter(LogLevel.WARN)}
            style={[
              styles.filterChip,
              filter === LogLevel.WARN && { backgroundColor: '#ff9800' }
            ]}
          >
            <Text style={[styles.filterChipText, filter === LogLevel.WARN && { color: 'white' }]}>
              Warnings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter(LogLevel.INFO)}
            style={[
              styles.filterChip,
              filter === LogLevel.INFO && { backgroundColor: '#2196f3' }
            ]}
          >
            <Text style={[styles.filterChipText, filter === LogLevel.INFO && { color: 'white' }]}>
              Info
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <Button variant="outlined" onPress={loadLogs} style={styles.button}>
            Refresh
          </Button>
          <Button variant="outlined" onPress={handleExportLogs} style={styles.button}>
            Export
          </Button>
          <Button variant="outlined" onPress={handleClearLogs} style={styles.button}>
            Clear
          </Button>
        </View>
      </View>

      <ScrollView style={styles.logContainer}>
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No logs to display</Text>
          </View>
        ) : (
          filteredLogs.map((log, index) => (
            <Card key={index} variant="outlined" style={[styles.logCard, { borderLeftColor: getColorForLevel(log.level), borderLeftWidth: 4 }]}>
              <View style={styles.cardContent}>
                <View style={styles.logHeader}>
                  <View style={[styles.levelChip, { backgroundColor: getColorForLevel(log.level) }]}>
                    <Text style={styles.levelText}>{log.level}</Text>
                  </View>
                  <Text style={styles.timestamp}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
                </View>
                <Text style={styles.category}>[{log.category}]</Text>
                <Text style={styles.message}>{log.message}</Text>
                {log.data && (
                  <View style={styles.dataContainer}>
                    <Text style={styles.dataLabel}>Data:</Text>
                    <Text style={styles.dataText}>{JSON.stringify(log.data, null, 2)}</Text>
                  </View>
                )}
                {log.stack && (
                  <View style={styles.stackContainer}>
                    <Text style={styles.stackLabel}>Stack:</Text>
                    <Text style={styles.stackText}>{log.stack}</Text>
                  </View>
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.neutral600,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral300,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    color: colors.neutral900,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  filterChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral200,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral700,
  },
  filterChipTextSelected: {
    color: colors.white,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  logContainer: {
    flex: 1,
    padding: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.neutral500,
  },
  logCard: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    padding: spacing.md,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  levelText: {
    color: 'white',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    color: colors.neutral600,
  },
  category: {
    fontSize: typography.sizes.xs,
    color: colors.neutral600,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.sizes.sm,
    color: colors.neutral900,
    marginBottom: spacing.sm,
  },
  dataContainer: {
    backgroundColor: colors.neutral100,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  dataLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.neutral600,
    marginBottom: spacing.xs,
  },
  dataText: {
    fontSize: typography.sizes.xs,
    fontFamily: 'monospace',
    color: colors.neutral900,
  },
  stackContainer: {
    backgroundColor: '#fff3cd',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  stackLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#856404',
    marginBottom: spacing.xs,
  },
  stackText: {
    fontSize: typography.sizes.xs,
    fontFamily: 'monospace',
    color: '#856404',
  },
})
