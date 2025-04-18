import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EditIcon, DeleteIcon } from "@/utils/iconMapping";
import { centers, sports } from "@/data/mockData";

export function CentersTab() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of all centers</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Sports</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {centers.map((center) => (
            <TableRow key={center.id}>
              <TableCell className="font-medium">{center.name}</TableCell>
              <TableCell>{center.location}</TableCell>
              <TableCell>{center.city}</TableCell>
              <TableCell>
                {center.sports.map(sportId => 
                  sports.find(s => s.id === sportId)?.name
                ).join(", ")}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon">
                  <EditIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <DeleteIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
