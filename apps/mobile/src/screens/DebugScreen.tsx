import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Share } from 'react-native'
import { Text, Button, Card, Chip, ActivityIndicator } from 'react-native-paper'
import logger, { LogEntry, LogLevel } from '../services/logger'

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
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading logs...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug Logs ({filteredLogs.length})</Text>
        <View style={styles.filterRow}>
          <Chip
            selected={filter === 'ALL'}
            onPress={() => setFilter('ALL')}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            selected={filter === LogLevel.ERROR}
            onPress={() => setFilter(LogLevel.ERROR)}
            style={[styles.filterChip, { backgroundColor: filter === LogLevel.ERROR ? '#f44336' : undefined }]}
            textStyle={{ color: filter === LogLevel.ERROR ? 'white' : undefined }}
          >
            Errors
          </Chip>
          <Chip
            selected={filter === LogLevel.WARN}
            onPress={() => setFilter(LogLevel.WARN)}
            style={[styles.filterChip, { backgroundColor: filter === LogLevel.WARN ? '#ff9800' : undefined }]}
            textStyle={{ color: filter === LogLevel.WARN ? 'white' : undefined }}
          >
            Warnings
          </Chip>
          <Chip
            selected={filter === LogLevel.INFO}
            onPress={() => setFilter(LogLevel.INFO)}
            style={[styles.filterChip, { backgroundColor: filter === LogLevel.INFO ? '#2196f3' : undefined }]}
            textStyle={{ color: filter === LogLevel.INFO ? 'white' : undefined }}
          >
            Info
          </Chip>
        </View>
        <View style={styles.buttonRow}>
          <Button mode="outlined" onPress={loadLogs} style={styles.button}>
            Refresh
          </Button>
          <Button mode="outlined" onPress={handleExportLogs} style={styles.button}>
            Export
          </Button>
          <Button mode="outlined" onPress={handleClearLogs} style={styles.button}>
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
            <Card key={index} style={[styles.logCard, { borderLeftColor: getColorForLevel(log.level) }]}>
              <Card.Content>
                <View style={styles.logHeader}>
                  <Chip
                    style={[styles.levelChip, { backgroundColor: getColorForLevel(log.level) }]}
                    textStyle={styles.levelText}
                  >
                    {log.level}
                  </Chip>
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
              </Card.Content>
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
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  logContainer: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  logCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelChip: {
    height: 24,
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  category: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  dataContainer: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  dataText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#333',
  },
  stackContainer: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  stackLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  stackText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#856404',
  },
})
