import React from "react";
import {
  pack,
  hierarchy,
  HierarchyCircularNode,
  HierarchyCircularLink,
} from "d3-hierarchy";
import { scaleLinear } from "d3-scale";

interface UserProfile {
  displayName: string;
  photoURL?: string;
}

interface CircleData extends UserProfile {
  id: string;
  value: number;
}

interface FormattedData extends CircleData {
  children: CircleData[];
}

interface CirclePackProps {
  data: FormattedData;
  width: number;
  height: number;
  backgroundColor: string;
}

const CirclePack: React.FC<CirclePackProps> = ({
  data,
  width,
  height,
  backgroundColor,
}) => {
  // Create a hierarchy object with constant value of 1 for each node
  const root = hierarchy<CircleData>(data).sum(() => 1); // Assign a constant value of 1 to each node

  const circlePack = pack<CircleData>().size([width, height]).padding(6);
  const nodes = circlePack(root).descendants();

  // Define scale for circle radius
  const maxRadius = Math.max(...nodes.map((node) => node.r || 0));
  const radiusScale = scaleLinear()
    .domain([0, maxRadius])
    .range([5, Math.min(width, height) / 2]);

  return (
    <svg
      width={width}
      height={height}
      className={`rounded-full bg-${backgroundColor}`}
    >
      {nodes.map((node, index) => (
        <g key={index} transform={`translate(${node.x},${node.y})`}>
          <circle
            r={
              data.children?.length === 1
                ? radiusScale(maxRadius / 2)
                : radiusScale(node.r || 0)
            }
            fill={node.data.photoURL ? `url(#image-${index})` : "transparent"}
          />
          {node.data.photoURL ? (
            <defs>
              <pattern
                id={`image-${index}`}
                x="0"
                y="0"
                width="100%"
                height="100%"
              >
                <image
                  x={
                    data.children?.length === 1
                      ? -radiusScale(maxRadius)
                      : -radiusScale(node.r || 0)
                  }
                  y={
                    data.children?.length === 1
                      ? -radiusScale(maxRadius)
                      : -radiusScale(node.r || 0)
                  }
                  className="w-full h-full object-cover"
                  href={node.data.photoURL}
                  preserveAspectRatio="xMidYMid meet"
                />
              </pattern>
            </defs>
          ) : (
            <text
              textAnchor="middle"
              alignmentBaseline="central"
              fill="#000"
              fontSize="10"
            >
              {node.data.displayName}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};

export default CirclePack;
