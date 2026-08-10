import { useState } from "react";
import { BodyTabs } from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import { Card, CardBody, CardTitle } from "@/shared/elements/Card";
import { Checkbox } from "@/shared/forms/Checkbox";
import { FormField } from "@/shared/forms/FormField";
import { Input } from "@/shared/forms/Input";
import { Radio } from "@/shared/forms/Radio";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { DemoPageShell } from "../../components/DemoPageShell";

const cityOptions = [
  { value: "hcm", label: "Ho Chi Minh City" },
  { value: "hn", label: "Ha Noi" },
  { value: "dn", label: "Da Nang" },
  { value: "hp", label: "Hai Phong" },
  { value: "ct", label: "Can Tho" },
  { value: "vt", label: "Vung Tau" },
];

export function LayoutsPage() {
  const [tab, setTab] = useState("layout");
  const [gridRadio, setGridRadio] = useState("one");
  const [city, setCity] = useState("");
  const [gridCity, setGridCity] = useState("");

  return (
    <DemoPageShell
      title="Form Layouts"
      subtitle="Build whatever layout you need with our Architect framework."
    >
      <BodyTabs
        items={[
          { id: "layout", label: "Layout" },
          { id: "grid", label: "Grid" },
        ]}
        activeId={tab}
        onChange={setTab}
      />

      {tab === "layout" ? (
        <>
          <Card>
            <CardBody>
              <CardTitle>Grid Rows</CardTitle>
              <form onSubmit={(e: { preventDefault(): void }) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 md:gap-x-[30px]">
                  <FormField label="Email" htmlFor="exampleEmail11">
                    <Input
                      id="exampleEmail11"
                      type="email"
                      placeholder="with a placeholder"
                    />
                  </FormField>
                  <FormField label="Password" htmlFor="examplePassword11">
                    <Input
                      id="examplePassword11"
                      type="password"
                      placeholder="password placeholder"
                    />
                  </FormField>
                </div>
                <FormField label="Address" htmlFor="exampleAddress">
                  <Input id="exampleAddress" placeholder="1234 Main St" />
                </FormField>
                <FormField label="Address 2" htmlFor="exampleAddress2">
                  <Input
                    id="exampleAddress2"
                    placeholder="Apartment, studio, or floor"
                  />
                </FormField>
                <div className="grid md:grid-cols-12 md:gap-x-[30px]">
                  <FormField label="City" htmlFor="exampleCity" className="md:col-span-6">
                    <SearchableSelect
                      id="exampleCity"
                      options={cityOptions}
                      value={city}
                      onChange={setCity}
                      placeholder="Search city..."
                    />
                  </FormField>
                  <FormField label="State" htmlFor="exampleState" className="md:col-span-4">
                    <Input id="exampleState" />
                  </FormField>
                  <FormField label="Zip" htmlFor="exampleZip" className="md:col-span-2">
                    <Input id="exampleZip" />
                  </FormField>
                </div>
                <Checkbox id="exampleCheck" label="Check me out" />
                <Button type="submit" className="mt-2">
                  Sign in
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <CardTitle>Inline</CardTitle>
              <form className="mb-3">
                <Checkbox inline label="Some input" />
                <Checkbox inline label="Some other input" />
              </form>
              <div className="mb-3 h-px bg-[#e9ecef]" />
              <form
                className="flex flex-wrap items-start gap-2"
                onSubmit={(e: { preventDefault(): void }) => e.preventDefault()}
              >
                <div className="min-w-44 flex-1">
                  <Input
                    defaultValue="email@example.com"
                    aria-label="Email"
                  />
                </div>
                <div className="min-w-40 flex-1">
                  <Input type="password" placeholder="Password" aria-label="Password" />
                </div>
                <div className="min-w-48 flex-1">
                  <SearchableSelect
                    options={cityOptions}
                    placeholder="City..."
                    searchPlaceholder="Search..."
                  />
                </div>
                <Button type="submit">Submit</Button>
              </form>
            </CardBody>
          </Card>
        </>
      ) : null}

      {tab === "grid" ? (
        <Card>
          <CardBody>
            <CardTitle>Grid</CardTitle>
            <form onSubmit={(e: { preventDefault(): void }) => e.preventDefault()}>
              <FormField label="Email" htmlFor="gridEmail" horizontal labelCols="sm:w-2/12">
                <Input id="gridEmail" type="email" placeholder="with a placeholder" />
              </FormField>
              <FormField
                label="Password"
                htmlFor="gridPassword"
                horizontal
                labelCols="sm:w-2/12"
              >
                <Input
                  id="gridPassword"
                  type="password"
                  placeholder="password placeholder"
                />
              </FormField>
              <FormField label="Select" htmlFor="gridSelect" horizontal labelCols="sm:w-2/12">
                <Select
                  id="gridSelect"
                  options={[
                    { value: "1", label: "1" },
                    { value: "2", label: "2" },
                    { value: "3", label: "3" },
                  ]}
                />
              </FormField>
              <FormField
                label="Searchable"
                htmlFor="gridSearch"
                horizontal
                labelCols="sm:w-2/12"
              >
                <SearchableSelect
                  id="gridSearch"
                  options={cityOptions}
                  value={gridCity}
                  onChange={setGridCity}
                  placeholder="Search city..."
                />
              </FormField>
              <FormField
                label="Select Multiple"
                htmlFor="gridSelectMulti"
                horizontal
                labelCols="sm:w-2/12"
              >
                <Select
                  id="gridSelectMulti"
                  multiple
                  htmlSize={4}
                  options={[
                    { value: "1", label: "1" },
                    { value: "2", label: "2" },
                    { value: "3", label: "3" },
                  ]}
                />
              </FormField>
              <FormField
                label="Text Area"
                htmlFor="gridText"
                horizontal
                labelCols="sm:w-2/12"
              >
                <Textarea id="gridText" rows={3} />
              </FormField>
              <FormField
                label="File"
                htmlFor="gridFile"
                horizontal
                labelCols="sm:w-2/12"
                help="This is some placeholder block-level help text for the above input. It's a bit lighter and easily wraps to a new line."
              >
                <Input id="gridFile" type="file" />
              </FormField>

              <div className="relative mb-3 flex flex-col sm:flex-row">
                <legend className="col-form-label mb-0 pt-2 text-sm text-[#495057] sm:w-2/12">
                  Radio Buttons
                </legend>
                <div className="min-w-0 flex-1">
                  <Radio
                    name="radio2"
                    value="one"
                    checked={gridRadio === "one"}
                    onChange={setGridRadio}
                    label="Option one is this and that—be sure to include why it's great"
                  />
                  <Radio
                    name="radio2"
                    value="two"
                    checked={gridRadio === "two"}
                    onChange={setGridRadio}
                    label="Option two can be something else and selecting it will deselect option one"
                  />
                  <Radio
                    name="radio2"
                    value="three"
                    disabled
                    checked={gridRadio === "three"}
                    onChange={setGridRadio}
                    label="Option three is disabled"
                  />
                </div>
              </div>

              <FormField label="Checkbox" horizontal labelCols="sm:w-2/12">
                <Checkbox id="checkbox2" label="Check me out" />
              </FormField>

              <div className="relative mb-3 flex">
                <div className="sm:w-2/12" />
                <div className="flex-1">
                  <Button type="submit" variant="secondary">
                    Submit
                  </Button>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}
    </DemoPageShell>
  );
}
