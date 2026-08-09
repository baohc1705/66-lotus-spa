import {
  Box,
  Inbox,
  MessageCircle,
  Settings,
  Wallet,
  BookOpen,
  Image,
  File,
  Coffee,
} from "lucide-react";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Dropdown } from "@/shared/elements/Dropdown";
import { Nav, NavItem, NavLink } from "@/shared/elements/Nav";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

export function NavigationPage() {
  return (
    <DemoPageShell
      title="Navigation Menus"
      subtitle="Navigation menus are one of the basic building blocks for any web or web application."
    >
      <DemoSection title="Vertical Menu">
        <div className="grid gap-6 md:grid-cols-2">
          <Nav vertical className="max-w-xs">
            <NavItem>
              <NavLink href="#">Link</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#">
                Link
                <Badge variant="success" className="ml-auto normal-case">
                  New
                </Badge>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#">
                Another Link
                <Badge variant="warning" className="ml-auto normal-case">
                  512
                </Badge>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#" disabled>
                Disabled Link
              </NavLink>
            </NavItem>
          </Nav>

          <Nav vertical className="max-w-xs">
            <NavItem>
              <NavLink href="#">
                <Inbox className="h-4 w-4" />
                <span>Inbox</span>
                <Badge variant="secondary" pill className="ml-auto normal-case">
                  86
                </Badge>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#">
                <BookOpen className="h-4 w-4" />
                <span>Book</span>
                <Badge variant="danger" pill className="ml-auto normal-case">
                  5
                </Badge>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#">
                <Image className="h-4 w-4" />
                <span>Picture</span>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#" disabled>
                <File className="h-4 w-4" />
                <span>File Disabled</span>
              </NavLink>
            </NavItem>
          </Nav>
        </div>

        <hr className="my-5 border-kit" />
        <div className="text-center">
          <Dropdown label="Dropdown Basic" variant="primary">
            <Nav vertical className="w-56 p-1">
              <NavItem>
                <NavLink href="#">Link</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#">
                  Link
                  <Badge variant="success" className="ml-auto normal-case">
                    New
                  </Badge>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#">
                  Another Link
                  <Badge variant="warning" className="ml-auto normal-case">
                    512
                  </Badge>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#" disabled>
                  Disabled Link
                </NavLink>
              </NavItem>
            </Nav>
          </Dropdown>
        </div>
      </DemoSection>

      <DemoSection title="Separators & Headers">
        <div className="grid gap-6 md:grid-cols-2">
          <Nav vertical className="max-w-xs">
            <NavItem header>Activity</NavItem>
            <NavItem>
              <NavLink href="#">
                Chat
                <Badge variant="info" pill className="ml-auto normal-case">
                  8
                </Badge>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#">Recover Password</NavLink>
            </NavItem>
            <NavItem header>My Account</NavItem>
            <NavItem>
              <NavLink href="#">
                Settings
                <Badge variant="success" className="ml-auto normal-case">
                  New
                </Badge>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#">
                Messages
                <Badge variant="warning" className="ml-auto normal-case">
                  512
                </Badge>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#">Logs</NavLink>
            </NavItem>
            <NavItem divider />
            <NavItem>
              <Button variant="danger" size="sm" wide className="m-2">
                Cancel
              </Button>
            </NavItem>
          </Nav>

          <Nav vertical className="max-w-xs">
            <NavItem header>Activity</NavItem>
            <NavItem>
              <NavLink href="#">
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
                <Badge variant="info" pill className="ml-auto normal-case">
                  8
                </Badge>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#">
                <Wallet className="h-4 w-4" />
                <span>Recover Password</span>
              </NavLink>
            </NavItem>
            <NavItem header>My Account</NavItem>
            <NavItem>
              <NavLink href="#">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
                <Badge variant="success" className="ml-auto normal-case">
                  New
                </Badge>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#">
                <Coffee className="h-4 w-4" />
                <span>Messages</span>
                <Badge variant="warning" className="ml-auto normal-case">
                  512
                </Badge>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#">
                <Box className="h-4 w-4" />
                <span>Logs</span>
              </NavLink>
            </NavItem>
            <NavItem divider />
            <NavItem>
              <Button variant="success" size="sm" pill className="m-2">
                Save
              </Button>
            </NavItem>
          </Nav>
        </div>
      </DemoSection>

      <DemoSection title="Horizontal Menu">
        <Nav>
          <NavLink href="#" active>
            Link
          </NavLink>
          <NavLink href="#">Link</NavLink>
          <NavLink href="#">Another Link</NavLink>
          <NavLink href="#" disabled>
            Disabled Link
          </NavLink>
        </Nav>

        <hr className="my-4 border-kit" />

        <Nav>
          <NavLink href="#" active>
            <Settings className="h-4 w-4" />
            <span>Link</span>
          </NavLink>
          <NavLink href="#">
            <Wallet className="h-4 w-4" />
            <span>Link</span>
            <Badge variant="danger" pill className="normal-case">
              12
            </Badge>
          </NavLink>
          <NavLink href="#">
            <span>Another Link</span>
          </NavLink>
          <NavLink href="#" disabled>
            <Box className="h-4 w-4" />
            <span>Disabled Link</span>
          </NavLink>
        </Nav>

        <hr className="my-4 border-kit" />

        <Nav justified>
          <NavItem>
            <NavLink href="#" active>
              <Settings className="h-4 w-4" />
              <span>Justified</span>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#">
              <MessageCircle className="h-4 w-4" />
              <span>Link</span>
              <Badge variant="success" className="normal-case">
                NEW
              </Badge>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#">
              <span>Another Link</span>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#" disabled>
              <Box className="h-4 w-4" />
              <span>Disabled Link</span>
            </NavLink>
          </NavItem>
        </Nav>
      </DemoSection>

      <DemoSection title="Active Links">
        <Nav pills>
          <NavLink href="#" active>
            Link
          </NavLink>
          <NavLink href="#">Link</NavLink>
          <NavLink href="#">Another Link</NavLink>
          <NavLink href="#" disabled>
            Disabled Link
          </NavLink>
        </Nav>

        <hr className="my-4 border-kit" />

        <Nav pills>
          <NavLink href="#" active>
            <Settings className="h-4 w-4" />
            <span>Link</span>
          </NavLink>
          <NavLink href="#">
            <Wallet className="h-4 w-4" />
            <span>Link</span>
            <Badge variant="danger" pill className="normal-case">
              12
            </Badge>
          </NavLink>
          <NavLink href="#">
            <span>Another Link</span>
          </NavLink>
          <NavLink href="#" disabled>
            <Box className="h-4 w-4" />
            <span>Disabled Link</span>
          </NavLink>
        </Nav>

        <hr className="my-4 border-kit" />

        <Nav pills justified>
          <NavItem>
            <NavLink href="#" active>
              <Settings className="h-4 w-4" />
              Justified
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#">
              <MessageCircle className="h-4 w-4" />
              Link
              <Badge variant="success" className="normal-case">
                NEW
              </Badge>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#">Another Link</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#" disabled>
              <Box className="h-4 w-4" />
              Disabled Link
            </NavLink>
          </NavItem>
        </Nav>
      </DemoSection>
    </DemoPageShell>
  );
}
