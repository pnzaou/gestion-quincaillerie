import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const PageSizeSelect = ({ limit, setLimit, setPage, tabSize }) => {
  return (
    <Select
      value={String(limit)}
      onValueChange={(val) => {
        setLimit(Number(val));
        setPage(1);
      }}
    >
      <SelectTrigger className="w-full sm:w-[200px]">
        <SelectValue>
          {/* Version courte sur très petit écran */}
          <span className="sm:hidden">{limit}/page</span>
          {/* Version complète sur écran normal */}
          <span className="hidden sm:inline">
            {limit ? `Articles par page : ${limit}` : "Articles par page"}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {tabSize.map((size) => (
          <SelectItem key={size} value={String(size)}>
            {`${size} par page`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PageSizeSelect;