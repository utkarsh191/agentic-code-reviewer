interface DiffLine {
  type: "added" | "removed" | "context";
  content: string;
}

interface DiffViewerProps {
  filename: string;
  diff: DiffLine[];
}

const getDiffLineClass = (
  type: DiffLine["type"]
) => {
  switch (type) {
    case "added":
      return "bg-green-500/10 text-green-400";

    case "removed":
      return "bg-red-500/10 text-red-400";

    case "context":
      return "text-gray-400";
  }
};

const getDiffLinePrefix = (
  type: DiffLine["type"]
) => {
  switch (type) {
    case "added":
      return "+";

    case "removed":
      return "-";

    case "context":
      return " ";
  }
};

const DiffViewer = ({
  filename,
  diff,
}: DiffViewerProps) => {
  return (
    <div className="mt-8">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          Diff
        </h2>

        <p className="mt-1 font-mono text-sm text-gray-400">
          {filename}
        </p>
      </div>

      {diff.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-500">
            No diff available for this file.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-800">
          <div className="overflow-x-auto bg-gray-900 font-mono text-sm">
            {diff.map((line, index) => (
              <div
                key={`${index}-${line.type}`}
                className={`flex min-w-max px-4 py-1 whitespace-pre ${getDiffLineClass(
                  line.type
                )}`}
              >
                <span className="mr-4 w-5 select-none text-gray-500">
                  {getDiffLinePrefix(line.type)}
                </span>

                <span>{line.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiffViewer;