import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const PageSizeSelect = ({limit, setLimit, setPage}) => {
    return (
        <Select
            value={String(limit)}
            onValueChange={(val) => {
            setLimit(Number(val));
            setPage(1);
            }}
        >
            <SelectTrigger className="w-[180px]">
            <SelectValue>
                {limit ? `Articles par page : ${limit}` : "Articles par page"}
            </SelectValue>
            </SelectTrigger>
            <SelectContent>
            {[5, 10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                {`Articles par page : ${size}`}
                </SelectItem>
            ))}
            </SelectContent>
        </Select>
    );
}

export default PageSizeSelect;
