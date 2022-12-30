import { DataFrame } from "danfojs";
import { VisualizationSpec } from "react-vega";
import { AnyMark } from "vega-lite/build/src/mark";
import { StandardType } from "vega-lite/build/src/type";
import { getVLSpec } from "../utils/getVLSpec";

export const MoviesAttributeTypes: { [key: string]: StandardType } = {
  "US Gross": "quantitative",
  "Worldwide Gross": "quantitative",
  "US DVD Sales": "quantitative",
  "Production Budget": "quantitative",
  "Release Date": "temporal",
  "MPAA Rating": "nominal",
  "Running Time min": "quantitative",
  "Distributor": "nominal",
  "Source": "nominal",
  "Major Genre": "nominal",
  "Creative Type": "nominal",
  Director: "nominal",
  "Rotten Tomatoes Rating": "quantitative",
  "IMDB Rating": "quantitative",
  "IMDB Votes": "quantitative",
};

export interface Attribute {
  name: string;
  type: StandardType;
}

export interface State {
  primary: Attribute;
  secondary: Attribute;
  df: DataFrame;
  provenance: string[];
  vlSpecs: VisualizationSpec[];

  loadVLSpec: () => void;
  getKey: () => string;
}

export class Node implements State {
  primary: Attribute;
  secondary: Attribute;
  df: DataFrame;
  provenance: string[];
  vlSpecs: VisualizationSpec[];

  constructor(
    primary: Attribute,
    secondary: Attribute,
    df: DataFrame,
    provenance: string[] = [],
  ) {
    this.primary = primary;
    this.secondary = secondary;
    this.df = df;
    this.provenance = provenance;
    this.vlSpecs = [];
  }

  isPrimaryBinned = () => this.provenance.includes("binning-primary");
  isSecondaryBinned = () => this.provenance.includes("binning-secondary");

  loadVLSpec = () => {
    this.vlSpecs.push(... getVLSpec(this));
  }

  getChild = () => {
    return new Node(
      { ...this.primary },
      { ...this.secondary },
      this.df.copy(),
      [... this.provenance],
    )
  }

  getKey = () => {
    return `${this.primary.name}-${this.secondary.name}`;
  };

}
export type AggType = "count" | "mean" | "sum" | "max" | "min"
export type GroupByFunction = (node: Node, agg: AggType) => Node | undefined;

export type FilterType = "gt" | "lt" | "ge" | "le" | "ne" | "eq"
export type FilterValue = "mean" | "median"
export type FilterFunction = (node: Node, type: FilterType, value: FilterValue) => Node | undefined;

export type BinningFunction = (node: Node, target: "primary" | "secondary") => Node | undefined;