import { makePendingActionsQueryKey } from "@api/query-keys/projects";
import { FETCH_PROJECT_ANALYTICS_KEY } from "@constants/queryKeys";

const isFloat = (num: number): boolean => num % 1 !== 0;

const formatNumberString = (
  num: number | null | undefined | string,
  needDecimal = false,
  locale = "en-US",
  minimumFractionDigits = 2,
  maxFractionDigits?: number
): string => {
  if (
    num === null ||
    num === undefined ||
    num === "undefined" ||
    Number.isNaN(num)
  ) {
    return needDecimal ? "0.00" : "0";
  }
  if (isFloat(Number(num)) || needDecimal) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: minimumFractionDigits,
      ...(maxFractionDigits !== undefined && {
        maximumFractionDigits: maxFractionDigits
      })
    }).format(Number(num));
  }
  const res = new Intl.NumberFormat(locale).format(Number(num));
  if (typeof res === "string") {
    return res;
  }
  if (Number.isNaN(res)) {
    return "-";
  }
  return res;
};

const centToDollar = (
  amount: string | number | null | undefined,
  roundOff = false,
  needDecimal?: boolean
) => {
  const pureNumber = Number(amount || 0);
  const newAmount = roundOff ? Math.round(pureNumber / 100) : pureNumber / 100;
  return `$${formatNumberString(newAmount, needDecimal)}`;
};

// Cypress test for the Pending Actions feature
describe("Pending Actions Feature", () => {
  beforeEach(() => {
    // Login first - this is required for accessing protected routes
    cy.login();

    // After successful login, visit the projects page
    cy.visit("/fulfillment-center/projects");

    cy.wait(25000);
  });

  it("verify metrics cards are showing correct data", () => {
    /* get queries data for the page */
    cy.getQueryData(makePendingActionsQueryKey()).then((response) => {
      cy.log("Pending Actions Response: ", response);
    });
    /*  [FETCH_PROJECT_ANALYTICS_KEY, inDemoMode] */
    /* response
		{
		"total_profit": 46559465943,
		"this_month_profit": 10000,
		"averageRetentionMonths": 5,
		"total_time_saved": 32737,
		"this_month_time_saved": 3418,
		"total_cost_saving": 124320800,
		"this_month_cost_saving": 12746100
}
		*/

    cy.getByTestId("project-analytics-cards-container").should("be.visible");
    cy.getByTestId("project-analytics-card").should("have.length", 4);

    cy.getQueryData([FETCH_PROJECT_ANALYTICS_KEY, false]).then((response) => {
      cy.log("Project Analytics Response: ", response);
      const metric = response?.data;
      // const metricsData = fulfillmentProjectsData(response);//? TODO: make it work, its giving webpack error, if we make it work a lot of hardcoding will be removed from the test cases

      // Verify the analytics cards container is visible
      cy.getByTestId("project-analytics-cards-container").should("be.visible");

      // Verify there are 4 analytics cards
      cy.getByTestId("project-analytics-card").should("have.length", 4);

      // Test the first card - Total Cost Savings
      cy.getByTestId("project-analytics-card")
        .first()
        .within(() => {
          // Check the title
          cy.getByTestId("analytics-header").should(
            "contain",
            "Total Cost Savings"
          );

          // Verify the value using the pre-formatted value from metricsData
          cy.getByTestId("analytics-value").should(
            "contain",
            centToDollar(metric?.total_cost_saving)
          );

          // Verify the subtext (this month data)
          cy.getByTestId("analytics-footer").should(
            "contain",
            `${centToDollar(metric?.this_month_cost_saving)} (This Month)`
          );
        });

      // Test the second card - Total Time Saved
      cy.getByTestId("project-analytics-card")
        .eq(1)
        .within(() => {
          cy.getByTestId("analytics-header").should(
            "contain",
            "Total Time Saved"
          );
          cy.getByTestId("analytics-value").should(
            "contain",
            `${formatNumberString(metric?.total_time_saved) ?? 0} Hours`
          );
          cy.getByTestId("analytics-footer").should(
            "contain",
            `${formatNumberString(metric?.this_month_time_saved) ?? 0} hrs (This Month)`
          );
        });

      // Test the third card - Total Profit
      cy.getByTestId("project-analytics-card")
        .eq(2)
        .within(() => {
          cy.getByTestId("analytics-header").should("contain", "Total Profit");
          cy.getByTestId("analytics-value").should(
            "contain",
            `${centToDollar(metric?.total_profit && metric?.total_profit > 0 ? metric?.total_profit : 0)}`
          );
          cy.getByTestId("analytics-footer").should(
            "contain",
            `${centToDollar(metric?.this_month_profit && metric?.this_month_profit > 0 ? metric?.this_month_profit : 0)} (This Month)`
          );
        });

      // Test the fourth card - Average Retention Rate
      cy.getByTestId("project-analytics-card")
        .eq(3)
        .within(() => {
          cy.getByTestId("analytics-header").should(
            "contain",
            "Average Retention Rate"
          );
          cy.getByTestId("analytics-value").should(
            "contain",
            `${metric?.averageRetentionMonths ?? 0} months`
          );
        });
    });
  });
});
