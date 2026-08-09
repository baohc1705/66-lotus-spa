import { useState } from "react";
import { Button } from "@/shared/elements/Button";
import { Card, CardBody, CardTitle } from "@/shared/elements/Card";
import { Checkbox } from "@/shared/forms/Checkbox";
import { FormFeedback } from "@/shared/forms/FormError";
import { FormField } from "@/shared/forms/FormField";
import { Input } from "@/shared/forms/Input";
import { InputGroup, InputGroupText } from "@/shared/forms/InputGroup";
import { DemoPageShell } from "../../components/DemoPageShell";

type FieldState = "idle" | "valid" | "invalid";

export function ValidationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [firstName, setFirstName] = useState("Mark");
  const [lastName, setLastName] = useState("Otto");
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [agree, setAgree] = useState(false);

  const [tipSubmitted, setTipSubmitted] = useState(false);
  const [tipFirst, setTipFirst] = useState("Mark");
  const [tipLast, setTipLast] = useState("Otto");
  const [tipUser, setTipUser] = useState("");
  const [tipCity, setTipCity] = useState("");
  const [tipRegion, setTipRegion] = useState("");
  const [tipZip, setTipZip] = useState("");

  function fieldState(value: string, required = true): FieldState {
    if (!submitted) return "idle";
    if (!required) return value ? "valid" : "idle";
    return value.trim() ? "valid" : "invalid";
  }

  function tipFieldState(value: string): FieldState {
    if (!tipSubmitted) return "idle";
    return value.trim() ? "valid" : "invalid";
  }

  return (
    <DemoPageShell
      title="Form Validation"
      subtitle="Inline validation is very easy to implement using our UI Framework."
    >
      <Card>
        <CardBody>
          <CardTitle>Form Validation</CardTitle>
          <form
            noValidate
            onSubmit={(e: { preventDefault(): void }) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <div className="grid md:grid-cols-3 md:gap-x-4">
              <FormField
                label="First name"
                htmlFor="validationCustom01"
                validMessage={fieldState(firstName) === "valid" ? "Looks good!" : undefined}
              >
                <Input
                  id="validationCustom01"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  valid={fieldState(firstName) === "valid"}
                  invalid={fieldState(firstName) === "invalid"}
                  required
                />
              </FormField>
              <FormField
                label="Last name"
                htmlFor="validationCustom02"
                validMessage={fieldState(lastName) === "valid" ? "Looks good!" : undefined}
              >
                <Input
                  id="validationCustom02"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  valid={fieldState(lastName) === "valid"}
                  invalid={fieldState(lastName) === "invalid"}
                  required
                />
              </FormField>
              <FormField label="Username" htmlFor="validationCustomUsername">
                <div className="relative">
                  <InputGroup>
                    <InputGroupText>@</InputGroupText>
                    <Input
                      id="validationCustomUsername"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      valid={fieldState(username) === "valid"}
                      invalid={fieldState(username) === "invalid"}
                      className="rounded-l-none"
                      required
                    />
                  </InputGroup>
                  {fieldState(username) === "invalid" ? (
                    <FormFeedback>Please choose a username.</FormFeedback>
                  ) : null}
                </div>
              </FormField>
            </div>

            <div className="grid md:grid-cols-12 md:gap-x-4">
              <FormField
                label="City"
                htmlFor="validationCustom03"
                className="md:col-span-6"
                error={
                  fieldState(city) === "invalid" ? "Please provide a valid city." : undefined
                }
              >
                <Input
                  id="validationCustom03"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  valid={fieldState(city) === "valid"}
                  invalid={fieldState(city) === "invalid"}
                  required
                />
              </FormField>
              <FormField
                label="State"
                htmlFor="validationCustom04"
                className="md:col-span-3"
                error={
                  fieldState(state) === "invalid" ? "Please provide a valid state." : undefined
                }
              >
                <Input
                  id="validationCustom04"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  valid={fieldState(state) === "valid"}
                  invalid={fieldState(state) === "invalid"}
                  required
                />
              </FormField>
              <FormField
                label="Zip"
                htmlFor="validationCustom05"
                className="md:col-span-3"
                error={
                  fieldState(zip) === "invalid" ? "Please provide a valid zip." : undefined
                }
              >
                <Input
                  id="validationCustom05"
                  placeholder="Zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  valid={fieldState(zip) === "valid"}
                  invalid={fieldState(zip) === "invalid"}
                  required
                />
              </FormField>
            </div>

            <div className="mb-3">
              <Checkbox
                id="invalidCheck"
                checked={agree}
                onChange={setAgree}
                label="Agree to terms and conditions"
              />
              {submitted && !agree ? (
                <FormFeedback>You must agree before submitting.</FormFeedback>
              ) : null}
            </div>

            <Button type="submit">Submit form</Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CardTitle>Tooltips Validation</CardTitle>
          <form
            noValidate
            onSubmit={(e: { preventDefault(): void }) => {
              e.preventDefault();
              setTipSubmitted(true);
            }}
          >
            <div className="grid md:grid-cols-3 md:gap-x-4">
              <FormField label="First name" htmlFor="validationTooltip01">
                <div className="relative">
                  <Input
                    id="validationTooltip01"
                    placeholder="First name"
                    value={tipFirst}
                    onChange={(e) => setTipFirst(e.target.value)}
                    valid={tipFieldState(tipFirst) === "valid"}
                    invalid={tipFieldState(tipFirst) === "invalid"}
                  />
                  {tipFieldState(tipFirst) === "valid" ? (
                    <FormFeedback type="valid" tooltip>
                      Looks good!
                    </FormFeedback>
                  ) : null}
                </div>
              </FormField>
              <FormField label="Last name" htmlFor="validationTooltip02">
                <div className="relative">
                  <Input
                    id="validationTooltip02"
                    placeholder="Last name"
                    value={tipLast}
                    onChange={(e) => setTipLast(e.target.value)}
                    valid={tipFieldState(tipLast) === "valid"}
                    invalid={tipFieldState(tipLast) === "invalid"}
                  />
                  {tipFieldState(tipLast) === "valid" ? (
                    <FormFeedback type="valid" tooltip>
                      Looks good!
                    </FormFeedback>
                  ) : null}
                </div>
              </FormField>
              <FormField label="Username" htmlFor="validationTooltipUsername">
                <div className="relative">
                  <InputGroup>
                    <InputGroupText>@</InputGroupText>
                    <Input
                      id="validationTooltipUsername"
                      placeholder="Username"
                      value={tipUser}
                      onChange={(e) => setTipUser(e.target.value)}
                      valid={tipFieldState(tipUser) === "valid"}
                      invalid={tipFieldState(tipUser) === "invalid"}
                      className="rounded-l-none"
                    />
                  </InputGroup>
                  {tipFieldState(tipUser) === "invalid" ? (
                    <FormFeedback tooltip>
                      Please choose a unique and valid username.
                    </FormFeedback>
                  ) : null}
                </div>
              </FormField>
            </div>

            <div className="grid md:grid-cols-12 md:gap-x-4">
              <FormField label="City" htmlFor="validationTooltip03" className="md:col-span-6">
                <div className="relative">
                  <Input
                    id="validationTooltip03"
                    placeholder="City"
                    value={tipCity}
                    onChange={(e) => setTipCity(e.target.value)}
                    valid={tipFieldState(tipCity) === "valid"}
                    invalid={tipFieldState(tipCity) === "invalid"}
                  />
                  {tipFieldState(tipCity) === "invalid" ? (
                    <FormFeedback tooltip>Please provide a valid city.</FormFeedback>
                  ) : null}
                </div>
              </FormField>
              <FormField label="State" htmlFor="validationTooltip04" className="md:col-span-3">
                <div className="relative">
                  <Input
                    id="validationTooltip04"
                    placeholder="State"
                    value={tipRegion}
                    onChange={(e) => setTipRegion(e.target.value)}
                    valid={tipFieldState(tipRegion) === "valid"}
                    invalid={tipFieldState(tipRegion) === "invalid"}
                  />
                  {tipFieldState(tipRegion) === "invalid" ? (
                    <FormFeedback tooltip>Please provide a valid state.</FormFeedback>
                  ) : null}
                </div>
              </FormField>
              <FormField label="Zip" htmlFor="validationTooltip05" className="md:col-span-3">
                <div className="relative">
                  <Input
                    id="validationTooltip05"
                    placeholder="Zip"
                    value={tipZip}
                    onChange={(e) => setTipZip(e.target.value)}
                    valid={tipFieldState(tipZip) === "valid"}
                    invalid={tipFieldState(tipZip) === "invalid"}
                  />
                  {tipFieldState(tipZip) === "invalid" ? (
                    <FormFeedback tooltip>Please provide a valid zip.</FormFeedback>
                  ) : null}
                </div>
              </FormField>
            </div>

            <Button type="submit" className="mt-1">
              Submit form
            </Button>
          </form>
        </CardBody>
      </Card>
    </DemoPageShell>
  );
}
