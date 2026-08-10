import { useState } from "react";
import { BodyTabs } from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import { Card, CardBody, CardTitle } from "@/shared/elements/Card";
import { Dropdown } from "@/shared/elements/Dropdown";
import { Checkbox } from "@/shared/forms/Checkbox";
import { FormField } from "@/shared/forms/FormField";
import { Input } from "@/shared/forms/Input";
import { InputGroup, InputGroupText } from "@/shared/forms/InputGroup";
import { Radio } from "@/shared/forms/Radio";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { DemoPageShell } from "../../components/DemoPageShell";

const selectOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

const cityOptions = [
  { value: "hcm", label: "Ho Chi Minh City" },
  { value: "hn", label: "Ha Noi" },
  { value: "dn", label: "Da Nang" },
  { value: "hp", label: "Hai Phong" },
  { value: "ct", label: "Can Tho" },
  { value: "vt", label: "Vung Tau" },
  { value: "nt", label: "Nha Trang" },
  { value: "dl", label: "Da Lat" },
];

const branchOptions = [
  { value: "d1", label: "District 1 Branch" },
  { value: "d3", label: "District 3 Branch" },
  { value: "bt", label: "Binh Thanh Branch" },
  { value: "tb", label: "Tan Binh Branch" },
  { value: "pn", label: "Phu Nhuan Branch" },
];

const dropdownItems = [
  { type: "header" as const, label: "Header" },
  { type: "item" as const, label: "Action" },
  { type: "item" as const, label: "Another Action" },
  { type: "divider" as const },
  { type: "item" as const, label: "Another Action" },
];

export function ControlsPage() {
  const [tab, setTab] = useState("basic");
  const [radio1, setRadio1] = useState("one");
  const [customRadio, setCustomRadio] = useState("a");
  const [city, setCity] = useState("");
  const [branch, setBranch] = useState("d1");

  return (
    <DemoPageShell
      title="Form Controls"
      subtitle="Wide selection of forms controls, using the Bootstrap 5 code base, but built with React."
    >
      <BodyTabs
        items={[
          { id: "basic", label: "Basic" },
          { id: "groups", label: "Input Groups" },
          { id: "custom", label: "Custom Controls" },
        ]}
        activeId={tab}
        onChange={setTab}
      />

      {tab === "basic" ? (
        <div className="grid md:grid-cols-2 md:gap-x-[30px]">
          <Card>
            <CardBody>
              <CardTitle>Controls Types</CardTitle>
              <form onSubmit={(e: { preventDefault(): void }) => e.preventDefault()}>
                <FormField label="Email" htmlFor="exampleEmail">
                  <Input id="exampleEmail" type="email" placeholder="with a placeholder" />
                </FormField>
                <FormField label="Password" htmlFor="examplePassword">
                  <Input
                    id="examplePassword"
                    type="password"
                    placeholder="password placeholder"
                  />
                </FormField>
                <FormField label="Select" htmlFor="exampleSelect">
                  <Select id="exampleSelect" options={selectOptions} defaultValue="1" />
                </FormField>
                <FormField label="Select Multiple" htmlFor="exampleSelectMulti">
                  <Select id="exampleSelectMulti" multiple htmlSize={4} options={selectOptions} />
                </FormField>
                <FormField label="Searchable Select" htmlFor="exampleSearchSelect">
                  <SearchableSelect
                    id="exampleSearchSelect"
                    options={cityOptions}
                    value={city}
                    onChange={setCity}
                    placeholder="Search city..."
                    searchPlaceholder="Type city name..."
                  />
                </FormField>
                <FormField label="Text Area" htmlFor="exampleText">
                  <Textarea id="exampleText" rows={3} />
                </FormField>
                <FormField
                  label="File"
                  htmlFor="exampleFile"
                  help="This is some placeholder block-level help text for the above input. It's a bit lighter and easily wraps to a new line."
                >
                  <Input id="exampleFile" type="file" />
                </FormField>
                <Button type="submit" className="mt-1">
                  Submit
                </Button>
              </form>
            </CardBody>
          </Card>

          <div>
            <Card>
              <CardBody>
                <CardTitle>Sizing</CardTitle>
                <Input inputSize="lg" placeholder="lg" className="mb-2" />
                <Input placeholder="default" className="mb-2" />
                <Input inputSize="sm" placeholder="sm" className="mb-2" />
                <div className="my-3 h-px bg-[#e9ecef]" />
                <Select
                  inputSize="lg"
                  className="mb-2"
                  options={[{ value: "lg", label: "Large Select" }]}
                />
                <Select
                  className="mb-2"
                  options={[{ value: "md", label: "Default Select" }]}
                />
                <Select
                  inputSize="sm"
                  className="mb-2"
                  options={[{ value: "sm", label: "Small Select" }]}
                />
                <div className="my-3 h-px bg-[#e9ecef]" />
                <SearchableSelect
                  inputSize="lg"
                  className="mb-2"
                  options={branchOptions}
                  value={branch}
                  onChange={setBranch}
                  placeholder="Large searchable"
                />
                <SearchableSelect
                  inputSize="sm"
                  options={branchOptions}
                  placeholder="Small searchable"
                />
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CardTitle>Checkboxes & Radios</CardTitle>
                <fieldset className="mb-3">
                  <Radio
                    name="radio1"
                    value="one"
                    checked={radio1 === "one"}
                    onChange={setRadio1}
                    label="Option one is this and that—be sure to include why it's great"
                  />
                  <Radio
                    name="radio1"
                    value="two"
                    checked={radio1 === "two"}
                    onChange={setRadio1}
                    label="Option two can be something else and selecting it will deselect option one"
                  />
                  <Radio
                    name="radio1"
                    value="three"
                    disabled
                    checked={radio1 === "three"}
                    onChange={setRadio1}
                    label="Option three is disabled"
                  />
                </fieldset>
                <Checkbox label="Check me out" />
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "groups" ? (
        <div className="grid md:grid-cols-2 md:gap-x-[30px]">
          <div>
            <Card>
              <CardBody>
                <CardTitle>Input Groups</CardTitle>
                <div className="space-y-3">
                  <InputGroup>
                    <InputGroupText>@</InputGroupText>
                    <Input placeholder="username" className="rounded-l-none" />
                  </InputGroup>
                  <InputGroup>
                    <InputGroupText>
                      <input type="checkbox" aria-label="Checkbox for following text input" />
                    </InputGroupText>
                    <Input placeholder="Check it out" className="rounded-l-none" />
                  </InputGroup>
                  <InputGroup>
                    <Input placeholder="username" className="rounded-r-none" />
                    <InputGroupText>@example.com</InputGroupText>
                  </InputGroup>
                  <InputGroup>
                    <InputGroupText>$</InputGroupText>
                    <Input placeholder="Amount" type="number" step={1} className="rounded-none" />
                    <InputGroupText>.00</InputGroupText>
                  </InputGroup>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CardTitle>Input Group Button Dropdown</CardTitle>
                <InputGroup>
                  <Dropdown
                    label="Button Dropdown"
                    variant="secondary"
                    items={dropdownItems}
                    className="mb-0 mr-0 [&>button]:mb-0 [&>button]:mr-0 [&>button]:rounded-r-none"
                  />
                  <Input className="rounded-l-none" />
                </InputGroup>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CardTitle>Input Group Button Shorthand</CardTitle>
                <div className="space-y-3">
                  <InputGroup>
                    <Button variant="secondary" className="mb-0 mr-0 rounded-r-none">
                      To the Left!
                    </Button>
                    <Input className="rounded-l-none" />
                  </InputGroup>
                  <InputGroup>
                    <Input className="rounded-r-none" />
                    <Button variant="secondary" className="mb-0 mr-0 rounded-l-none">
                      To the Right!
                    </Button>
                  </InputGroup>
                  <InputGroup>
                    <Button variant="danger" className="mb-0 mr-0 rounded-r-none">
                      To the Left!
                    </Button>
                    <Input placeholder="and..." className="rounded-none" />
                    <Button variant="success" className="mb-0 mr-0 rounded-l-none">
                      To the Right!
                    </Button>
                  </InputGroup>
                </div>
              </CardBody>
            </Card>
          </div>

          <div>
            <Card>
              <CardBody>
                <CardTitle>Input Group Sizing</CardTitle>
                <div className="space-y-3">
                  <InputGroup size="lg">
                    <InputGroupText>@lg</InputGroupText>
                    <Input className="rounded-l-none" />
                  </InputGroup>
                  <InputGroup>
                    <InputGroupText>@normal</InputGroupText>
                    <Input className="rounded-l-none" />
                  </InputGroup>
                  <InputGroup size="sm">
                    <InputGroupText>@sm</InputGroupText>
                    <Input className="rounded-l-none" />
                  </InputGroup>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CardTitle>Input Group Addon</CardTitle>
                <div className="space-y-3">
                  <InputGroup>
                    <InputGroupText>To the Left!</InputGroupText>
                    <Input className="rounded-l-none" />
                  </InputGroup>
                  <InputGroup>
                    <Input className="rounded-r-none" />
                    <InputGroupText>To the Right!</InputGroupText>
                  </InputGroup>
                  <InputGroup>
                    <InputGroupText>To the Left!</InputGroupText>
                    <Input placeholder="and..." className="rounded-none" />
                    <InputGroupText>To the Right!</InputGroupText>
                  </InputGroup>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <CardTitle>Input Group Button</CardTitle>
                <div className="space-y-3">
                  <InputGroup>
                    <Button variant="secondary" className="mb-0 mr-0 rounded-r-none">
                      I'm a button
                    </Button>
                    <Input className="rounded-l-none" />
                  </InputGroup>
                  <InputGroup>
                    <Input className="rounded-r-none" />
                    <Dropdown
                      label="Button Dropdown"
                      variant="secondary"
                      items={dropdownItems}
                      className="mb-0 mr-0 [&>button]:mb-0 [&>button]:mr-0 [&>button]:rounded-l-none"
                    />
                  </InputGroup>
                  <InputGroup>
                    <Button variant="outline-secondary" className="mb-0 mr-0 rounded-r-none">
                      Split Button
                    </Button>
                    <Input placeholder="and..." className="rounded-none" />
                    <Button variant="secondary" className="mb-0 mr-0 rounded-l-none">
                      I'm a button
                    </Button>
                  </InputGroup>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "custom" ? (
        <div className="grid md:grid-cols-2 md:gap-x-[30px]">
          <div>
            <Card>
              <CardBody>
                <CardTitle>Checkboxes</CardTitle>
                <Checkbox id="c1" label="Check this custom checkbox" />
                <Checkbox id="c2" label="Or this one" />
                <Checkbox id="c3" label="But not this disabled one" disabled />
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Inline</CardTitle>
                <Checkbox id="ci1" inline label="An inline custom input" />
                <Checkbox id="ci2" inline label="and another one" />
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Searchable Select</CardTitle>
                <FormField label="City" htmlFor="customSearchCity">
                  <SearchableSelect
                    id="customSearchCity"
                    options={cityOptions}
                    placeholder="Choose a city..."
                    searchPlaceholder="Filter cities..."
                  />
                </FormField>
                <FormField label="Branch" htmlFor="customSearchBranch">
                  <SearchableSelect
                    id="customSearchBranch"
                    options={branchOptions}
                    defaultValue="d1"
                    placeholder="Choose branch..."
                  />
                </FormField>
                <FormField label="Disabled" htmlFor="customSearchDisabled">
                  <SearchableSelect
                    id="customSearchDisabled"
                    options={branchOptions}
                    defaultValue="d3"
                    disabled
                  />
                </FormField>
              </CardBody>
            </Card>
          </div>
          <div>
            <Card>
              <CardBody>
                <CardTitle>Radios</CardTitle>
                <Radio
                  id="r1"
                  name="customRadio"
                  value="a"
                  checked={customRadio === "a"}
                  onChange={setCustomRadio}
                  label="Select this custom radio"
                />
                <Radio
                  id="r2"
                  name="customRadio"
                  value="b"
                  checked={customRadio === "b"}
                  onChange={setCustomRadio}
                  label="Or this one"
                />
                <Radio
                  id="r3"
                  name="customRadio"
                  value="c"
                  disabled
                  checked={customRadio === "c"}
                  onChange={setCustomRadio}
                  label="But not this disabled one"
                />
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Form Select</CardTitle>
                <div className="grid md:grid-cols-2 md:gap-x-4">
                  <div>
                    <FormField label="Custom Select">
                      <Select defaultValue="">
                        <option value="">Select</option>
                        <option>Value 1</option>
                        <option>Value 2</option>
                        <option>Value 3</option>
                        <option>Value 4</option>
                        <option>Value 5</option>
                      </Select>
                    </FormField>
                    <FormField label="Custom Multiple Select">
                      <Select multiple htmlSize={4}>
                        <option>Value 1</option>
                        <option>Value 2</option>
                        <option>Value 3</option>
                        <option>Value 4</option>
                        <option>Value 5</option>
                      </Select>
                    </FormField>
                  </div>
                  <div>
                    <FormField label="Custom Select Disabled">
                      <Select disabled defaultValue="">
                        <option value="">Select</option>
                        <option>Value 1</option>
                      </Select>
                    </FormField>
                    <FormField label="Custom Multiple Select Disabled">
                      <Select multiple disabled htmlSize={4}>
                        <option>Value 1</option>
                        <option>Value 2</option>
                      </Select>
                    </FormField>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}
    </DemoPageShell>
  );
}
