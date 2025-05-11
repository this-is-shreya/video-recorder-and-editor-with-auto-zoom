// export const checkIfElementsOverlapping = (e) => {
//   const draggableRect = e.target.getBoundingClientRect();
//   const allElements = Array.from(
//     document.getElementsByClassName("react-draggable-dragged")
//   );
//   let isSpaceOccupied = false;
// //   console.log("allElements", allElements);
//   if (allElements.length > 1) {
//     allElements.forEach((el) => {
//       if (el !== e.target) {
//         const elRect = el.getBoundingClientRect();
//         if (
//           draggableRect.left < elRect.right &&
//           draggableRect.right > elRect.left &&
//           draggableRect.top < elRect.bottom &&
//           draggableRect.bottom > elRect.top
//         ) {
//           console.log("elrect>>", elRect)
//           console.log("current ele>>", draggableRect)
//           isSpaceOccupied = true;
//           return;
//         }
//       }
//     });
//   }
//   return isSpaceOccupied;
// };

export const checkIfElementsOverlapping = (newRect) => {
  //for image we can have a default duration

  // const draggableRect = e.target.getBoundingClientRect();
  const allElements = Array.from(
    document.getElementsByClassName("react-draggable")
  );

  // Return false if no other elements are present
  // if (allElements.length <= 1) {
  //   console.log("no elememts present ", allElements);
  //   return false;
  // }

  // for (const el of allElements) {
  //   // Skip the current element
  //   if (el !== e.target) {
  //     const elRect = el.getBoundingClientRect();
  //     console.log(elRect.left, draggableRect.left+duration*10)
  //     // Check for overlap
  //     if (
  //       draggableRect.left < elRect.right &&
  //       draggableRect.left +duration*10 > elRect.left
  //     ) {
  //       console.log("Overlap detected!");
  //       console.log("Current:", draggableRect, "Other:", elRect);
  //       return true; // Break early on overlap
  //     }
  //   }
  // }

  // return false; // No overlap detected
  for (const el of allElements) {
    const elRect = el.getBoundingClientRect();
    if ((newRect.left < elRect.left && newRect.right < elRect.right)
      || (newRect.left > elRect.left && newRect.right < elRect.right) 
    || (newRect.left < elRect.left && newRect.right > elRect.right)) {
      console.log("Overlap detected!");
      console.log("New Rect:", newRect, "Other Rect:", elRect);
      return true; // Overlap found
    }
  }
  return false; // No overlap
};


// export const checkIfElementsOverlappingOnStop = (e, duration) => {
//   //for image we can have a default duration

//   const draggableRect = e.target.getBoundingClientRect();
//   const allElements = Array.from(
//     document.getElementsByClassName("react-draggable")
//   );

//   // Return false if no other elements are present
//   if (allElements.length <= 1) {
//     console.log("no elememts present ", allElements);
//     return false;
//   }

//   for (const el of allElements) {
//     // Skip the current element
//     if (el !== e.target) {
//     const elRect = el.getBoundingClientRect();
//       // Check for overlap
//       const newRect = { left : draggableRect.left, right: draggableRect.left + duration*10}
//       console.log(elRect, newRect);
      
//       if (
//         (newRect.left > elRect.left && newRect.left < elRect.right) ||
//         (newRect.right > elRect.left && newRect.right < elRect.right) ||
//         (elRect.left > newRect.left && elRect.left < newRect.right) ||
//         (elRect.right > newRect.left && elRect.right < newRect.right)
//       ) {
//         console.log("Overlap detected!");
//         console.log("Current:", draggableRect, "Other:", elRect);
//         return true; // Break early on overlap
//       }
//     }
//   }

//   return false; // No overlap detected
// };


export const checkIfElementsOverlappingOnStop = (e, duration) => {
  // Get bounding box of the dragged element
  const draggableRect = e.target.getBoundingClientRect();
  const allElements = Array.from(
    document.getElementsByClassName("react-draggable")
  );

  // Return false if no other elements are present
  if (allElements.length <= 1) {
    console.log("No other elements present:", allElements);
    return false;
  }

  // Calculate newRect based on duration or current width
  const newRect = {
    left: draggableRect.left,
    right: draggableRect.left + duration * 10, // Replace with draggableRect.width if needed
  };

  for (const el of allElements) {
    // Skip the current element
    if (el !== e.target) {
      const elRect = el.getBoundingClientRect();

      console.log(
        "Checking overlap with:",
        elRect,
        "Dragged Element:",
        newRect
      );

      // Check for overlap using helper function
      if (isOverlapping(newRect, elRect)) {
        console.log("Overlap detected!");
        return true; // Overlap found
      }
    }
  }

  return false; // No overlap detected
};

// Helper function to check overlap
const isOverlapping = (rect1, rect2) => {
  return (
    (rect1.left > rect2.left && rect1.left < rect2.right) || // rect1's left edge is inside rect2
    (rect1.right > rect2.left && rect1.right < rect2.right) || // rect1's right edge is inside rect2
    (rect2.left > rect1.left && rect2.left < rect1.right) || // rect2's left edge is inside rect1
    (rect2.right > rect1.left && rect2.right < rect1.right) // rect2's right edge is inside rect1
  );
};
