// Function for loading all fonts used in a text node
const loadFonts = async (textNode: TextNode) => {
  // Get an array of all the font names used in the text node
  const fontNames = textNode.getRangeAllFontNames(0, textNode.characters.length);

  // Load all the fonts asynchronously
  await Promise.all(fontNames.map(figma.loadFontAsync));
};

// Define the new line heights as an array
const skipLineHeights = false;

// Get the selected frame
const selectedFrame = figma.currentPage.selection[0] as FrameNode;

if (selectedFrame) {
  const nodesToReplace = [];

  // Find all nodes with padding, gap, or font size values to replace
  function findNodesToReplace(node: BaseNode) {
    if ('paddingLeft' in node || 'paddingRight' in node || 'paddingTop' in node || 'paddingBottom' in node || 'itemSpacing' in node || 'gridStyleId' in node) {
      nodesToReplace.push(node);
    }

    if ('children' in node) {
      node.children.forEach(child => findNodesToReplace(child));
    }
  }

  findNodesToReplace(selectedFrame);

  // Replace padding and gap values in all nodes
  nodesToReplace.forEach(node => {
    if ('paddingLeft' in node) {
      node.paddingLeft = replacePaddingValue(node.paddingLeft);
    }

    if ('paddingRight' in node) {
      node.paddingRight = replacePaddingValue(node.paddingRight);
    }

    if ('paddingTop' in node) {
      node.paddingTop = replacePaddingValue(node.paddingTop);
    }

    if ('paddingBottom' in node) {
      node.paddingBottom = replacePaddingValue(node.paddingBottom);
    }

    if ('itemSpacing' in node) {
      node.itemSpacing = replacePaddingValue(node.itemSpacing);
    }

    if ('gridStyleId' in node) {
      node.gridStyleId = replacePaddingValue(node.gridStyleId);
    }
  });

  // Replace font sizes and line heights in all text nodes
  const textNodes = selectedFrame.findAll(node => node.type === "TEXT") as TextNode[];
  if (textNodes.length === 0) {
    // Show an error message if no text nodes are found
    figma.notify("Spacings updated successfully.");
    figma.closePlugin();
  } else {
    // Keep track of the number of fonts that are still loading
    let numFontsLoading = 0;

    textNodes.forEach(async textNode => {
      // Load all fonts used in the text node
      numFontsLoading++;
      await loadFonts(textNode);

      // Replace font size in the text node
      const oldFontSize = textNode.fontSize;
      const newFontSize = getNewFontSize(oldFontSize);
      textNode.fontSize = newFontSize;

      // Replace line height in the text node
      if (textNode.lineHeight.unit === "PIXELS") {
        const lineHeight = textNode.lineHeight.value;
        const newLineHeight = getNewLineHeight(lineHeight);
        textNode.lineHeight = { unit: "PIXELS", value: newLineHeight };
      }
      // Reset the line height of the text node to "auto"
      if (skipLineHeights === true) {
        textNode.lineHeight = { unit: "AUTO" };
      }

      // Decrement the count of fonts that are still loading
      numFontsLoading--;
      if (numFontsLoading === 0) {
        // Close the plugin when all fonts have finished loading
        figma.notify("Font sizes and spacings updated successfully.");
        figma.closePlugin();
      }
    });
  }
} else {
  // Show an error message if no frame is selected
  figma.notify("Please select a frame.");
  figma.closePlugin();
}

function replacePaddingValue(value: number): number {
  const paddingValuesToReplace = getPaddingValuesToReplace();
  const paddingNewValues = paddingValuesToReplace.map(getNewPaddingValue);
  const index = paddingValuesToReplace.indexOf(value);
  if (index !== -1) {
    return paddingNewValues[index];
  }
  return value;
}

function getPaddingValuesToReplace(): number[] {
  const paddingValuesToReplace = new Set<number>();
  const nodesToCheck = [selectedFrame];
  while (nodesToCheck.length > 0) {
    const node = nodesToCheck.pop();
    if ('paddingLeft' in node) {
      paddingValuesToReplace.add(node.paddingLeft);
    }
    if ('paddingRight' in node) {
      paddingValuesToReplace.add(node.paddingRight);
    }
    if ('paddingTop' in node) {
      paddingValuesToReplace.add(node.paddingTop);
    }
    if ('paddingBottom' in node) {
      paddingValuesToReplace.add(node.paddingBottom);
    }
    if ('itemSpacing' in node) {
      paddingValuesToReplace.add(node.itemSpacing);
    }
    if ('gridStyleId' in node) {
      paddingValuesToReplace.add(node.gridStyleId);
    }
    if ('children' in node) {
      nodesToCheck.push(...node.children);
    }
  }
  return Array.from(paddingValuesToReplace);
}

function getNewPaddingValue(oldValue: number): number {
  switch (true) {
    case (oldValue <= 16):
      return oldValue;
    case (oldValue <= 24):
      return Math.floor(oldValue / 16) * 14;
    case (oldValue <= 32):
      return Math.floor(oldValue / 16) * 12;
    case (oldValue <= 48):
      return Math.floor(oldValue / 16) * 10;
    case (oldValue <= 80):
      return Math.floor(oldValue / 16) * 8;
    case (oldValue <= 128):
      return Math.floor(oldValue / 16) * 6;
    default:
      return Math.floor(oldValue / 16) * 4;
  }
}

function getNewLineHeight(oldValue: number): number {
  switch (true) {
    case (oldValue <= 16):
      return oldValue;
    case (oldValue <= 24):
    case (oldValue <= 32):
      return Math.floor(oldValue / 16) * 14;
    case (oldValue <= 48):
      return Math.floor(oldValue / 16) * 12;
    case (oldValue <= 80):
      return Math.floor(oldValue / 16) * 10;
    case (oldValue <= 128):
    case (oldValue <= 256):
      return Math.floor(oldValue / 16) * 8;
    default:
      return Math.floor(oldValue / 16) * 4;
  }
}
function getNewFontSize(oldValue: number): number {
  switch (true) {
    case (oldValue <= 16):
      return oldValue;
    case (oldValue <= 24):
    case (oldValue <= 32):
      return Math.floor(oldValue / 16) * 14;
    case (oldValue <= 48):
      return Math.floor(oldValue / 16) * 12;
    case (oldValue <= 80):
      return Math.floor(oldValue / 16) * 10;
    case (oldValue <= 128):
    case (oldValue <= 256):
      return Math.floor(oldValue / 16) * 8;
    default:
      return Math.floor(oldValue / 16) * 4;
  }
}
