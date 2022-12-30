import { Container, SimpleGrid, Center, Text, VStack, Button } from "@chakra-ui/react"
import { index } from "d3-array"
import * as dfd from "danfojs"
import { useMemo, useState } from "react"
import { VegaLite, VisualizationSpec } from "react-vega"
import data from "../data/movies.json"
import { Node, MoviesAttributeTypes } from "../types"
import { getVLSpec } from "../utils/getVLSpec"
import { wranglingList } from "../utils/wrangling"

export default function Home() {
    const [index, setIndex] = useState(0)
    const df = useMemo(() => new dfd.DataFrame(data).drop({ columns: "Title" }), [])
    const columns = useMemo(() => df.columns, [df])

    const visualizationNodes = useMemo<Node[]>(() => {
        // 2 permutations of columns
        const pairs = []
        for (let i = 0; i < columns.length; i++) {
            for (let j = i + 1; j < columns.length; j++) {
                pairs.push([columns[i], columns[j]])
            }
        }

        const queue: Node[] = []
        const specs: Node[] = []

        // initialization

        for (const pair of pairs) {
            const node = new Node({ name: pair[0], type: MoviesAttributeTypes[pair[0]] }, { name: pair[1], type: MoviesAttributeTypes[pair[1]] }, df.loc({ columns: pair }))
            queue.push(node)
        }

        while (queue.length > 0) {
            const node = queue.shift()!
            node.loadVLSpec()
            if (node.vlSpecs.length > 0) specs.push(node)

            if (node.provenance.length === 4) continue
            wranglingList.forEach((wrangling, i) => {
                try {
                    const child = wrangling(node)
                    if (child) queue.push(child)
                } catch (e) {
                    console.log(node.primary, node.secondary, node.provenance, i)
                }
            })
        }
        console.log(specs.length)
        return specs
    }, [columns, df])

    return (
        <Container maxW={"container-xl"}>
            <SimpleGrid minChildWidth={300} spacing={4}>
                {visualizationNodes.map(node => node.vlSpecs.map((spec, i) => (
                    <VStack key={i}>
                        <Text fontSize="x-small">{spec["mark"]}</Text>
                        <Text fontSize="x-small">{node.provenance.join(" -> ")}</Text>
                        <VegaLite spec={spec} data={{ data: dfd.toJSON(node.df, { format: "column" }) }} />
                    </VStack>
                )))}
            </SimpleGrid>
        </Container>
    )
}
