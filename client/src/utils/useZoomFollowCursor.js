"use client";

import { useContext, useEffect, useRef, useState } from "react";
import AppContext from "../AppContext";
import { pixels } from "./PixelsPerSecondEnum";


export function useZoomFollowCursor({
  videoRef,
  previewSize,
  cursorDataObj,
  zoomLevel = 2,
}) {
  
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const animationRef = useRef();
  const { seekerPosition, zoomTimeline } = useContext(AppContext);

  const getCoordinates = (cursorPoint, videoWidth, videoHeight) => {
    // Calculate the cursor position in pixels
    const cursorX = cursorPoint.x * videoWidth;
    const cursorY = cursorPoint.y * videoHeight;

    // Calculate offset to keep cursor centered in the zoomed view
    // Simple offset calculation - center the cursor in the viewport
    const centerX = videoWidth / 2;
    const centerY = videoHeight / 2;

    const offsetX = centerX - cursorX;
    const offsetY = centerY - cursorY;

    // Calculate proper boundaries for clamping
    // The amount we can move in each direction
    const maxMoveX = (videoWidth * (zoomLevel - 1)) / 2;
    const maxMoveY = (videoHeight * (zoomLevel - 1)) / 2;

    // Clamp the offset to prevent showing areas outside the original video
    const clampedOffsetX = Math.max(-maxMoveX, Math.min(maxMoveX, offsetX));
    const clampedOffsetY = Math.max(-maxMoveY, Math.min(maxMoveY, offsetY));

    return { x: clampedOffsetX, y: clampedOffsetY };
  }
  useEffect(() => {
    if (!videoRef.current || !cursorDataObj?.length) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      return;
    }

    const animate = () => {
      const video = videoRef.current;
      if (!video) return;

      const currentTime = Math.floor(seekerPosition / pixels[zoomTimeline]);
      // Convert normalized coordinates to pixels
      const videoWidth =
        typeof previewSize.width === "number"
          ? previewSize.width
          : Number.parseInt(previewSize.width);
      const videoHeight =
        typeof previewSize.height === "number"
          ? previewSize.height
          : Number.parseInt(previewSize.height);

      // Find active cursor session
      const activeSession = cursorDataObj.find(
        (session) =>
          currentTime >= session.startTime && currentTime <= session.endTime
      );

      if (!activeSession) {
        // Outside session time - no zoom
        setScale(1);
        setOffset({ x: 0, y: 0 });
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (!activeSession.cursorData) {
        setScale(activeSession.zoomLevel);
        const coordinates = getCoordinates(activeSession.offset, videoWidth, videoHeight);
        setOffset(coordinates || { x: 0, y: 0 });
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Inside session time - zoom and follow
      const currentTimeSeconds = currentTime;

      // Find closest cursor point using relative timestamps
      const sessionTime = currentTime - activeSession.startTime;
      let cursorPoint = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const point of activeSession.cursorData) {
        const distance = Math.abs(point.timestamp - sessionTime);
        if (distance < closestDistance) {
          closestDistance = distance;
          cursorPoint = point;
        }
      }

      if (!cursorPoint) {
        setScale(1);
        setOffset({ x: 0, y: 0 });
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const coordinates = getCoordinates(
        cursorPoint,
        videoWidth,
        videoHeight
      );

      setScale(activeSession.zoomLevel || zoomLevel);
      setOffset(coordinates);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [videoRef, cursorDataObj, previewSize, zoomLevel, seekerPosition]);

  return { scale, offset };
}
