import React from "react";
import {
  Image,
  StyleSheet,
  type ImageStyle,
  type StyleProp,
} from "react-native";
import { getPlaceImage } from "@/utils/placeImages";

type Props = {
  category: string;
  style?: StyleProp<ImageStyle>;
};

const PlaceCategoryImage = ({ category, style }: Props) => {
  return (
    <Image
      source={getPlaceImage(category)}
      style={[styles.image, style]}
      resizeMode="cover"
    />
  );
};

export default PlaceCategoryImage;

const styles = StyleSheet.create({
  image: {
    backgroundColor: "#E0E0E0",
  },
});
