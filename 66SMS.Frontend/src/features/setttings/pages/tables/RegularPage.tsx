import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableResponsive,
  TableRow,
} from "@/shared/tables/Table";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

const people = [
  { id: 1, first: "Mark", last: "Otto", user: "@mdo" },
  { id: 2, first: "Jacob", last: "Thornton", user: "@fat" },
  { id: 3, first: "Larry", last: "the Bird", user: "@twitter" },
];

function PeopleRows() {
  return (
    <>
      {people.map((row) => (
        <TableRow key={row.id}>
          <TableCell asHeader>{row.id}</TableCell>
          <TableCell>{row.first}</TableCell>
          <TableCell>{row.last}</TableCell>
          <TableCell>{row.user}</TableCell>
        </TableRow>
      ))}
    </>
  );
}

function PeopleHead() {
  return (
    <TableHead>
      <TableRow>
        <TableHeaderCell>#</TableHeaderCell>
        <TableHeaderCell>First Name</TableHeaderCell>
        <TableHeaderCell>Last Name</TableHeaderCell>
        <TableHeaderCell>Username</TableHeaderCell>
      </TableRow>
    </TableHead>
  );
}

export function RegularPage() {
  return (
    <DemoPageShell
      title="Regular Tables"
      subtitle="Tables are the backbone of almost all web applications."
    >
      <div className="grid lg:grid-cols-2 lg:gap-x-8">
        <DemoSection title="Simple table">
          <Table>
            <PeopleHead />
            <TableBody>
              <PeopleRows />
            </TableBody>
          </Table>
        </DemoSection>

        <DemoSection title="Table bordered">
          <Table bordered>
            <PeopleHead />
            <TableBody>
              <PeopleRows />
            </TableBody>
          </Table>
        </DemoSection>

        <DemoSection title="Table without border">
          <Table borderless>
            <PeopleHead />
            <TableBody>
              <PeopleRows />
            </TableBody>
          </Table>
        </DemoSection>

        <DemoSection title="Table dark">
          <Table dark>
            <PeopleHead />
            <TableBody>
              <PeopleRows />
            </TableBody>
          </Table>
        </DemoSection>

        <DemoSection title="Table with hover">
          <Table hover>
            <PeopleHead />
            <TableBody>
              <PeopleRows />
            </TableBody>
          </Table>
        </DemoSection>

        <DemoSection title="Table responsive">
          <TableResponsive>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>#</TableHeaderCell>
                  <TableHeaderCell>Table heading</TableHeaderCell>
                  <TableHeaderCell>Table heading</TableHeaderCell>
                  <TableHeaderCell>Table heading</TableHeaderCell>
                  <TableHeaderCell>Table heading</TableHeaderCell>
                  <TableHeaderCell>Table heading</TableHeaderCell>
                  <TableHeaderCell>Table heading</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3].map((id) => (
                  <TableRow key={id}>
                    <TableCell asHeader>{id}</TableCell>
                    <TableCell>Table cell</TableCell>
                    <TableCell>Table cell</TableCell>
                    <TableCell>Table cell</TableCell>
                    <TableCell>Table cell</TableCell>
                    <TableCell>Table cell</TableCell>
                    <TableCell>Table cell</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableResponsive>
        </DemoSection>

        <DemoSection title="Table sizing">
          <Table size="sm">
            <PeopleHead />
            <TableBody>
              <PeopleRows />
            </TableBody>
          </Table>
        </DemoSection>

        <DemoSection title="Table striped">
          <Table striped>
            <PeopleHead />
            <TableBody>
              <PeopleRows />
            </TableBody>
          </Table>
        </DemoSection>
      </div>
    </DemoPageShell>
  );
}
