import {
  RangeAnchor,
  TextPositionAnchor,
  TextQuoteAnchor,
} from "../anchoring/types";

import { highlightRange } from "../highlighter";
import classnames from "classnames";

import { anchor as htmlAnchor } from "../anchoring/html";
import { TextRange } from "../anchoring/text-range";
import { ADDER_TYPE } from "../adder/type";

/**
 * Describe current integration anchor
 */
export const describe = function (root, range) {
  const types = [RangeAnchor, TextPositionAnchor, TextQuoteAnchor];
  const result = [];
  for (let type of types) {
    try {
      const anchor = type.fromRange(root, range);
      result.push(anchor.toSelector());
    } catch (error) {}
  }
  return result;
};

/**
 * Resolve anchor
 */
export const resolveAnchor = (anchor) => {
  if (!anchor.range) {
    return null;
  }
  try {
    return anchor.range.toRange();
  } catch {
    return null;
  }
}

/**
 * Anchor to element
 */
export const anchor = async (annotation, element) => {
  const getCssName = () => {
    const cssNameMap = {
      [ADDER_TYPE.HIGHLIGHT]: "hypothesis-highlight",
      [ADDER_TYPE.UNDERLINE]: "hypothesis-underline",
    }

    return cssNameMap[annotation.type] || cssNameMap[ADDER_TYPE.HIGHLIGHT];
  }

  /**
   * Resolve an annotation's selectors to a concrete range.
   */
  const locate = async (target) => {
    // Only annotations with an associated quote can currently be anchored.
    // This is because the quote is used to verify anchoring with other selector
    // types.
    if (
        !target.selector ||
        !target.selector.some((s) => s.type === "TextQuoteSelector")
    ) {
      return { annotation, target };
    }

    /** @type {Anchor} */
    let anchor;
    try {
      const range = await htmlAnchor(element, target.selector);
      // Convert the `Range` to a `TextRange` which can be converted back to
      // a `Range` later. The `TextRange` representation allows for highlights
      // to be inserted during anchoring other annotations without "breaking"
      // this anchor.
      const textRange = TextRange.fromRange(range);
      anchor = { annotation, target, range: textRange };
    } catch (err) {
      anchor = { annotation, target };
    }
    return anchor;
  };

  /**
   * Highlight the text range that `anchor` refers to.
   *
   * @param {Anchor} anchor
   */
  const highlight = (anchor) => {
    const range = resolveAnchor(anchor);
    if (!range) {
      return;
    }

    const highlights = highlightRange(
        range,
        classnames(getCssName(), anchor.annotation?.$cluster),
        () => {
          const card = document.getElementById(`annotation-card-${annotation.id}`);
          if (card) {
            card.scrollIntoView({ behavior: "smooth" });
          }
        }
    );
    highlights.forEach((h) => {
      h._annotation = anchor.annotation;
    });
    anchor.highlights = highlights;
  };

  // // Remove existing anchors for this annotation.
  // this.detach(annotation.$tag, false /* notify */);
  //
  // this._annotations.add(annotation.$tag);

  // Resolve selectors to ranges and insert highlights.
  if (!annotation.target) {
    annotation.target = [];
  }

  const anchors = await Promise.all(annotation.target.map(locate));

  for (let anchor of anchors) {
    highlight(anchor);
  }

  // Set flag indicating whether anchoring succeeded. For each target,
  // anchoring is successful either if there are no selectors (ie. this is a
  // Page Note) or we successfully resolved the selectors to a range.
  annotation.$orphan =
      anchors.length > 0 &&
      anchors.every((anchor) => anchor.target.selector && !anchor.range);

  return anchors;
}