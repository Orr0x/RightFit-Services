import React, { useState } from 'react'
import { View, StyleSheet, Alert, Modal, TouchableOpacity, Text } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../services/api'
import { Button, Spinner } from './ui'
import { colors, spacing, typography, borderRadius } from '../styles/tokens'

interface PhotoUploadButtonProps {
  workOrderId?: string
  propertyId?: string
  onPhotoUploaded?: () => void
  label?: string
}

export default function PhotoUploadButton({
  workOrderId,
  propertyId,
  onPhotoUploaded,
  label = 'Add Photo',
}: PhotoUploadButtonProps) {
  const [menuVisible, setMenuVisible] = useState(false)
  const [uploading, setUploading] = useState(false)

  const requestPermissions = async (type: 'camera' | 'media') => {
    try {
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos.')
          return false
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Photo library permission is required to select photos.')
          return false
        }
      }
      return true
    } catch (error) {
      console.error('Permission request error:', error)
      return false
    }
  }

  const handleTakePhoto = async () => {
    setMenuVisible(false)

    const hasPermission = await requestPermissions('camera')
    if (!hasPermission) return

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri)
      }
    } catch (error: any) {
      console.error('Camera error:', error)
      Alert.alert('Error', 'Failed to take photo: ' + error.message)
    }
  }

  const handleSelectPhoto = async () => {
    setMenuVisible(false)

    const hasPermission = await requestPermissions('media')
    if (!hasPermission) return

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri)
      }
    } catch (error: any) {
      console.error('Gallery error:', error)
      Alert.alert('Error', 'Failed to select photo: ' + error.message)
    }
  }

  const uploadPhoto = async (uri: string) => {
    try {
      setUploading(true)

      // Create FormData for multipart upload
      const formData = new FormData()

      // Extract filename from URI
      const uriParts = uri.split('/')
      const filename = uriParts[uriParts.length - 1]

      // Append the file
      formData.append('photo', {
        uri,
        type: 'image/jpeg',
        name: filename || 'photo.jpg',
      } as any)

      // Add optional parameters
      if (workOrderId) {
        formData.append('work_order_id', workOrderId)
        formData.append('label', 'DURING')
      }
      if (propertyId) {
        formData.append('property_id', propertyId)
        formData.append('label', 'PROPERTY')
      }

      await api.uploadPhoto(formData)

      Alert.alert('Success', 'Photo uploaded successfully!')
      if (onPhotoUploaded) {
        onPhotoUploaded()
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      Alert.alert(
        'Upload Failed',
        error.response?.data?.error || 'Failed to upload photo. Please try again.'
      )
    } finally {
      setUploading(false)
    }
  }

  if (uploading) {
    return (
      <View style={styles.uploadingContainer}>
        <Spinner size="small" />
        <Text style={styles.uploadingText}>Uploading...</Text>
      </View>
    )
  }

  return (
    <View>
      <Button
        variant="primary"
        onPress={() => setMenuVisible(true)}
        style={styles.button}
      >
        {label}
      </Button>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleTakePhoto}>
              <Text style={styles.menuItemText}>📷 Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSelectPhoto}>
              <Text style={styles.menuItemText}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    marginVertical: spacing.sm,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
    padding: spacing.md,
  },
  uploadingText: {
    marginLeft: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.neutral700,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    minWidth: 250,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItem: {
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  menuItemText: {
    fontSize: typography.sizes.md,
    color: colors.neutral900,
  },
})
