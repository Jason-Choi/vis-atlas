import { VisualizationSpec } from "react-vega";
import { Node } from "../types";

const baseSpec = {
  width: 180,
  height: 180,
  data: { name: "data" }
};

const MAX_CATEGORY = 10;

export const getVLSpec = (node: Node): VisualizationSpec[] => {
  const specs: VisualizationSpec[] = [];

  // Scatterplot 
  if (
    node.primary.type === "quantitative" && !node.isPrimaryBinned() &&
    node.secondary.type === "quantitative" && !node.isSecondaryBinned()
  ) {
    specs.push({
      ...baseSpec,
      mark: "circle",
      encoding: {
        x: { field: node.primary.name, type: node.primary.type },
        y: { field: node.secondary.name, type: node.secondary.type },
      },
    })
  }

  // Bar chart
  if (
    (node.secondary.type === "quantitative" && !node.isSecondaryBinned()) &&
    ((["ordinal", "nominal", "temporal"].includes(node.primary.type) && node.df.shape[0] < MAX_CATEGORY) ||
      node.isPrimaryBinned())
  ) {
    specs.push({
      ...baseSpec,
      mark: "bar",
      encoding: {
        x: { field: node.primary.name, type: node.primary.type, bin: node.isPrimaryBinned() },
        y: { field: node.secondary.name, type: node.secondary.type },
      },
    })
  }
  // Line chart
  if (
    node.secondary.type === "quantitative" && !node.isSecondaryBinned() &&
    ["ordinal", "temporal"].includes(node.primary.type)
  ) {
    specs.push({
      ...baseSpec,
      mark: "line",
      encoding: {
        x: { field: node.primary.name, type: node.primary.type },
        y: { field: node.secondary.name, type: node.secondary.type },
      },
    })

    specs.push({
      ...baseSpec,
      mark: "area",
      encoding: {
        x: { field: node.primary.name, type: node.primary.type },
        y: { field: node.secondary.name, type: node.secondary.type },
      },
    })
  }
  // Heatmap
  if (
    ((["ordinal", "nominal"].includes(node.primary.type) && node.df.shape[0] < MAX_CATEGORY) || node.isPrimaryBinned()) &&
    ((["ordinal", "nominal"].includes(node.secondary.type) && node.df.shape[0] < MAX_CATEGORY) || node.isSecondaryBinned())
  )
    specs.push({
      ...baseSpec,
      mark: "rect",
      encoding: {
        x: { field: node.primary.name, type: node.primary.type, bin: node.isPrimaryBinned() },
        y: { field: node.secondary.name, type: node.secondary.type, bin: node.isSecondaryBinned() },
        color: { aggregate: "count", type: "quantitative" }
      },
    })

  // Pie chart
  if (
    ["nominal"].includes(node.primary.type) && node.df.shape[0] < MAX_CATEGORY &&
    node.secondary.type === "quantitative" && !node.isSecondaryBinned()
  ) {
    specs.push({
      ...baseSpec,
      mark: "arc",
      encoding: {
        theta: { field: node.secondary.name, type: node.secondary.type },
        color: { field: node.primary.name, type: node.primary.type },
      },
    })
  }

  return specs
}