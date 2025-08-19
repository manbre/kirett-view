"use client";

type NodeData = Record<string, unknown> | null;

type Props = {
  selectedNode: NodeData; // der Parent übergibt null oder ein Node-Objekt
};

export const InfoPanel = ({ selectedNode }: Props) => {
  if (!selectedNode) {
    return (
      <div className="bg-fore flex h-full w-full items-center justify-center rounded-xl p-4 text-sm text-gray-500">
        Kein Knoten ausgewählt
      </div>
    );
  }

  return (
    <div className="bg-fore h-full w-full overflow-auto rounded-xl p-4">
      <h2 className="mb-2 text-lg font-semibold">
        {"ID: " + selectedNode?.data.id}
      </h2>
      <dl className="space-y-1 text-sm">{"BPR: " + selectedNode?.data.BPR}</dl>
      {selectedNode?.data.SAA ? (
        <dl className="space-y-1 text-sm">
          {"SAA: " + selectedNode?.data.SAA}
        </dl>
      ) : (
        ""
      )}
      <dl className="space-y-1 text-sm">
        {"Name: " + selectedNode?.data.Name}
      </dl>
    </div>
  );
};
