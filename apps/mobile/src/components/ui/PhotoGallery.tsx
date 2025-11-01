import React, { useState } from 'react'
import { View, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native'
import ImageView from 'react-native-image-viewing'
import { colors, spacing, borderRadius } from '../../styles/tokens'

/**
 * PhotoGallery Component
 * STORY-004: Mobile UX Polish
 *
 * Displays a grid of photos with lightbox viewer
 * - Pinch to zoom
 * - Swipe between photos
 * - Double-tap to zoom
 */

const { width } = Dimensions.get('window')
const COLUMN_COUNT = 3
const IMAGE_SIZE = (width - spacing[4] * 4) / COLUMN_COUNT

export interface Photo {
  uri: string
  id: string
}

export interface PhotoGalleryProps {
  photos: Photo[]
  onDelete?: (photoId: string) => void
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, onDelete }) => {
  const [visible, setVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleImagePress = (index: number) => {
    setCurrentIndex(index)
    setVisible(true)
  }

  const imageData = photos.map((photo) => ({ uri: photo.uri }))

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => handleImagePress(index)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.uri }} style={styles.thumbnail} resizeMode="cover" />
          </TouchableOpacity>
        )}
      />

      <ImageView
        images={imageData}
        imageIndex={currentIndex}
        visible={visible}
        onRequestClose={() => setVisible(false)}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    padding: spacing[2],
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: spacing[1],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.neutral100,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
})

export default PhotoGallery
