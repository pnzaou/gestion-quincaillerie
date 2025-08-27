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
      <SelectTrigger className="w-full sm:w-44">
        <SelectValue>
          {limit ? `Articles par page : ${limit}` : "Articles par page"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {tabSize.map((size) => (
          <SelectItem key={size} value={String(size)}>
            {`Articles par page : ${size}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PageSizeSelect;
