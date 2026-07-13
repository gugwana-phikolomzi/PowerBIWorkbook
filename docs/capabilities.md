For a visual like this—effectively a self-service Pivot/Analysis Visual inside Power BI—I would think about capabilities in layers. The goal is to make users feel they don't need to export to Excel.

Capabilities to add
Field well management
Add field to Rows
Add field to Columns
Add field to Values
Add field to Filters
Drag fields between wells
Reorder fields within a well
Remove fields
Multi-select fields
Clear a whole well
Visual data-type indicators: ABC, 123, date, boolean
Disable invalid drop zones automatically
Value aggregation
Sum
Average
Count
Distinct count
Minimum
Maximum
Median
First / Last
Standard deviation
Variance
No aggregation
Automatic recommended aggregation based on field type
Pivot calculations
% of Grand Total
% of Row Total
% of Column Total
Running Total
Difference From
% Difference From
Rank
Index
Year-over-Year change
Month-over-Month change
Previous period
Cumulative value
Date intelligence
Automatic date hierarchy
Year → Quarter → Month → Day
Fiscal year support
Week / ISO week
Relative periods
Current year
Current month
YTD
QTD
MTD
Previous year
Previous period
Rolling 3 / 6 / 12 months
Row and column hierarchy
Expand
Collapse
Expand all
Collapse all
Drill down
Drill up
Multi-level rows
Multi-level columns
Stepped layout
Tabular layout
Repeat row labels
Show hierarchy breadcrumbs
Filtering
Basic value filtering
Search within values
Include / exclude
Top N
Bottom N
Greater than / less than
Between
Contains
Starts with
Relative date filtering
Filter by measure
Keep only selected
Exclude selected
Clear individual filters
Clear all filters
Show active filter count
Sorting
Ascending
Descending
Sort by value
Sort by another measure
Multi-column sorting
Custom sort order
Manual row order
Preserve user sorting
Conditional formatting
Background colour
Font colour
Data bars
Icons
Traffic lights
Rules
Colour scales
Top / bottom highlighting
Negative value highlighting
Variance highlighting
Apply to values
Apply to totals
Apply to entire row
Number formatting
Currency
Percentage
Decimal places
Thousands separator
Display units: K / M / B
Negative number format
Accounting format
Date formatting
Custom format strings
Per-measure formatting
Totals and subtotals
Grand totals
Row totals
Column totals
Subtotals
Per-level subtotals
Subtotal position
Show / hide totals
Custom total labels
Bold totals
Sticky totals

Summary statistics

Count
Sum
Average
Median
Minimum
Maximum
Standard deviation
Missing values
Unique values
Zero values
Negative values

I would make this a Profile or Summary mode rather than forcing everything into the pivot.

Field profiling
Data type
Distinct count
Null count
Null %
Minimum
Maximum
Average
Distribution
Most common value
Top values
Date range
Numeric range

Multiple analysis modes

Pivot
Table
Summary
Profile

Potentially later:

Crosstab
Distribution
Correlation

This fits very well with the visual direction we discussed previously.

User workspace
Remember field layout
Remember filters
Remember sorting
Remember column widths
Save analysis view
Rename view
Duplicate view
Reset view
Recently used fields
Favourite fields

Presets / saved views

"Monthly Performance"
"Consultant Summary"
"Team Leader Analysis"
"Year-on-Year"
"Exceptions"

Users should be able to build a pivot and save the configuration, assuming the Power BI custom visual persistence model supports the specific experience you want.

Field search and discovery
Search fields
Search aliases
Group fields by table
Group fields by category
Recently used
Recommended fields
Favourite fields
Hide technical fields
Field descriptions on hover
Smart field behaviour
Date → recommend Rows or Columns
Text → recommend Rows
Numeric → recommend Values
Measure → Values only
Warn when cardinality is extremely high
Warn when a field may create thousands of columns
Suggest aggregation
Suggest date hierarchy

Performance protection

Row limits
Column limits
Cell limits
Cardinality warnings
Query loading indicator
Cancel query
Progressive rendering
Virtual scrolling
Pagination
Lazy hierarchy expansion
"Showing first 10,000 rows" warning

This is critical. A self-service visual can very quickly let a user create a ridiculous pivot.

Context menu actions
Keep only
Exclude
Drill down
Drill through
Copy value
Copy row
Copy column
Copy table
Show as %
Sort ascending
Sort descending
Add conditional formatting
Export and copy
Copy cell
Copy selected cells
Copy table
Copy with headers
Export CSV
Export Excel-compatible data
Preserve pivot structure where technically possible
Keyboard support
Arrow-key navigation
Shift selection
Ctrl selection
Ctrl+C
Ctrl+A
Delete to remove a field from a well
Enter to expand hierarchy
Escape to close menus
Keyboard field search

Undo / redo

Undo field move
Undo filter
Undo sort
Undo formatting
Redo

The undo/redo controls in the rendering should be real functionality, not decorative.

Analysis history

"Added Calendar Year to Columns"
"Changed Sales Amount to Average"
"Filtered Region to Western Cape"
"Sorted by Sales Amount"

This could power undo/redo and eventually become an analysis trail.

Empty-state intelligence
Instead of just:

Drag fields here

show contextual suggestions:

Add a category to Rows

Add a date field to Columns

Add a numeric field to Values

The UI should teach the user how to build the pivot.

Error and warning system
Too many unique values
Unsupported aggregation
No numeric values
Query exceeded limit
Field removed from semantic model
Invalid saved configuration
Circular calculation
Unsupported hierarchy
Power BI integration
Cross-filter other visuals
Receive filters from other visuals
Highlight selections
Drill-through
Tooltips
Bookmark compatibility
Theme support
High-contrast mode
Power BI selection manager integration
Host formatting support
Admin / developer configuration
Since the developer chooses which fields are exposed, I would add:
Friendly field name
Field description
Field category
Default aggregation
Allowed wells
Allowed aggregations
Hidden field
Default format
Sort field
Fiscal date configuration
High-cardinality warning threshold

Advanced self-service capabilities
Later, the visual could support:

Calculated fields
Simple formulas
Revenue / Cases
Actual - Target
% Variance
Named calculations
Calculation reuse

I would not build this in v1. It starts turning the visual into a mini analytical engine.

AI-assisted analysis
Much later:

"Show claims by team leader and month"
"Compare this year to last year"
"Show the top 10 consultants"
"Why is this value high?"

The visual translates the instruction into a field-well configuration.

The capability I think could make this visual special: Analysis Profiles

A user clicks Profile, selects Consultant, and immediately sees unique values, missing %, top consultants and frequency distribution. They select Cycle Time and see min, max, median, average, distribution and outliers. They click Pivot, and the same fields become available for pivot analysis.

That turns the project from "a custom pivot table" into a self-service data exploration workspace inside Power BI.

For your long-term goal of maintaining one visual that enables self-service, I would define the product around four core modes: Table → Pivot → Summary → Profile. Everything else should support those four experiences.