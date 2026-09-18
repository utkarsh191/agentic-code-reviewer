interface ChangedFile {
  filename: string;
  status: "added" | "modified" | "deleted";
  additions: number;
  deletions: number;
}

interface ChangedFilesProps {
  files: ChangedFile[];
  selectedFile: string | null;
  onSelectFile: (filename: string) => void;
}

const getStatusClass = (
  status: ChangedFile["status"]
) => {
  switch (status) {
    case "added":
      return "bg-green-500/10 text-green-400";

    case "modified":
      return "bg-yellow-500/10 text-yellow-400";

    case "deleted":
      return "bg-red-500/10 text-red-400";
  }
};

const ChangedFiles = ({
  files,
  selectedFile,
  onSelectFile,
}: ChangedFilesProps) => {
  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">
        Changed Files ({files.length})
      </h2>

      {files.length === 0 ? (
        <p className="text-sm text-gray-500">
          No changed files found for this pull request.
        </p>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <button
              key={file.filename}
              type="button"
              onClick={() => onSelectFile(file.filename)}
              className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                selectedFile === file.filename
                  ? "border-blue-500 bg-blue-950/20"
                  : "border-gray-800 bg-gray-900 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase ${getStatusClass(
                      file.status
                    )}`}
                  >
                    {file.status}
                  </span>

                  <span className="truncate font-mono text-sm text-gray-200">
                    {file.filename}
                  </span>
                </div>

                <div className="flex shrink-0 gap-3 text-sm">
                  <span className="text-green-400">
                    +{file.additions}
                  </span>

                  <span className="text-red-400">
                    -{file.deletions}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChangedFiles;