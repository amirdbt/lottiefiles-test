import { render } from "@testing-library/react";
import Skeleton from "./Skeleton";

describe("Skeleton", () => {
  it("should render a skeleton", () => {
    render(<Skeleton />);
  });
});
