import { BinningFunction, FilterFunction, GroupByFunction, Node } from "../types";

export const binning: BinningFunction = (node, target) => {
  if (node.df.shape[0] < 100) return undefined
  if (node[target].type !== "quantitative") return undefined
  if (target === "primary" && node.isPrimaryBinned()) return undefined
  if (target === "secondary" && node.isSecondaryBinned()) return undefined

  const newNode = node.getChild()
  newNode.provenance.push(`binning-${target}`)
  
  return newNode
}


export const groupby: GroupByFunction = (state, agg) => {
  if (!(
    ["nominal", "ordinal", "temporal"].includes(state.primary.type) &&
    !state.isPrimaryBinned() &&
    !state.isSecondaryBinned() &&
    !state.provenance.some((p) => p.startsWith("groupby")) &&
    (agg === "count" ||
    (["mean", "sum"].includes(agg) && ["quantitative"].includes(state.secondary.type)) ||
    (["max", "min"].includes(agg) && ["quantitative"].includes(state.secondary.type)) )
  )) return undefined
  

  const newNode = state.getChild()
  newNode.provenance.push(`groupby-${agg}`)
  newNode.df = newNode.df.groupby([newNode.primary.name]).col([newNode.secondary.name])[agg]()
  newNode.secondary.name = `${newNode.secondary.name}_${agg}`
  newNode.secondary.type = "quantitative"

  return newNode
}

export const filtering: FilterFunction = (node, type, value) => {
  if (node.primary.type !== "quantitative") return undefined
  if (node.isPrimaryBinned()) return undefined

  const newNode = node.getChild()
  newNode.provenance.push(`filtering-${type}-${value}`)
  const filteringValue: number = newNode.df[newNode.primary.name][value]()
  newNode.df = newNode.df.query(newNode.df[newNode.primary.name][type](filteringValue))

  return newNode
}


export const wranglingList = [
  (state: Node) => binning(state, "primary"),
  (state: Node) => binning(state, "secondary"),
  (state: Node) => groupby(state, "count"),
  (state: Node) => groupby(state, "mean"),
  (state: Node) => groupby(state, "sum"),
  (state: Node) => groupby(state, "max"),
  (state: Node) => groupby(state, "min"),
  (state: Node) => filtering(state, "gt", "mean"),
  (state: Node) => filtering(state, "lt", "mean"),
]



