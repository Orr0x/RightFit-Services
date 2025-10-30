/**
 * Photo Gallery Component
 * US-UX-14: Photo Gallery Redesign (2 pts)
 *
 * Grid view with lightbox, zoom, and photo metadata
 */

import React, { useState } from 'react'
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Text,
  Alert,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')
const GRID_SPACING = 8
const NUM_COLUMNS = 3
const THUMB_SIZE = (width - GRID_SPACING * (NUM_COLUMNS + 1)) / NUM_COLUMNS

export interface Photo {
  id: string
  url: string
  thumbnailUrl?: string
  createdAt?: Date
  size?: number
  metadata?: Record<string, any>
}

interface PhotoGalleryProps {
  photos: Photo[]
  onDelete?: (photoId: string) => void
  editable?: boolean
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onDelete,
  editable = false,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [lightboxVisible, setLightboxVisible] = useState(false)

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo)
    setLightboxVisible(true)
  }

  const closeLightbox = () => {
    setLightboxVisible(false)
    setTimeout(() => setSelectedPhoto(null), 300)
  }

  const handleDelete = () => {
    if (!selectedPhoto || !onDelete) return

    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(selectedPhoto.id)
            closeLightbox()
          },
        },
      ]
    )
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const kb = bytes / 1024
    const mb = kb / 1024
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'Unknown date'
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderItem = ({ item }: { item: Photo }) => (
    <TouchableOpacity
      style={styles.thumbnail}
      onPress={() => openLightbox(item)}
    >
      <Image
        source={{ uri: item.thumbnailUrl || item.url }}
        style={styles.thumbnailImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  )

  return (
    <>
      <FlatList
        data={photos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="photo-library" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No photos yet</Text>
          </View>
        }
      />

      {/* Lightbox Modal */}
      <Modal
        visible={lightboxVisible}
        transparent={true}
        onRequestClose={closeLightbox}
        animationType="fade"
      >
        <View style={styles.lightbox}>
          <TouchableOpacity
            style={styles.lightboxClose}
            onPress={closeLightbox}
          >
            <MaterialIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          {selectedPhoto && (
            <>
              <Image
                source={{ uri: selectedPhoto.url }}
                style={styles.lightboxImage}
                resizeMode="contain"
              />

              {/* Photo Metadata */}
              <View style={styles.metadata}>
                <Text style={styles.metadataText}>
                  {formatDate(selectedPhoto.createdAt)}
                </Text>
                <Text style={styles.metadataText}>
                  {formatFileSize(selectedPhoto.size)}
                </Text>
              </View>

              {/* Delete Button */}
              {editable && onDelete && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                >
                  <MaterialIcons name="delete" size={24} color="#fff" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  grid: {
    padding: GRID_SPACING,
  },
  row: {
    gap: GRID_SPACING,
  },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    marginBottom: GRID_SPACING,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  empty: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxClose: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  lightboxImage: {
    width: '100%',
    height: '80%',
  },
  metadata: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metadataText: {
    color: '#fff',
    fontSize: 14,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
