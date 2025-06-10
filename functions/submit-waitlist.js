exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    // Parse the form data
    const formData = JSON.parse(event.body);

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "company",
      "website",
      "sellToday",
      "revenue",
      "customers",
      "commitBratislava",
      "commitAmsterdam",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Missing required fields",
          missingFields,
        }),
      };
    }

    // Clean and prepare sellToday data
    let sellTodayArray = [];
    let otherCountries = "";

    if (Array.isArray(formData.sellToday)) {
      sellTodayArray = formData.sellToday;
    } else if (typeof formData.sellToday === "string") {
      sellTodayArray = formData.sellToday.split(",");
    }

    // Clean each country name and separate "other" entries
    const validEUCountries = [
      "Austria",
      "Belgium",
      "Bulgaria",
      "Croatia",
      "Cyprus",
      "Czech Republic",
      "Denmark",
      "Estonia",
      "Finland",
      "France",
      "Germany",
      "Greece",
      "Hungary",
      "Ireland",
      "Italy",
      "Latvia",
      "Lithuania",
      "Luxembourg",
      "Malta",
      "Netherlands",
      "Poland",
      "Portugal",
      "Romania",
      "Slovakia",
      "Slovenia",
      "Spain",
      "Sweden",
    ];

    const cleanedCountries = [];
    const customCountries = [];

    sellTodayArray.forEach((country) => {
      const cleaned = country.trim().replace(/^["']|["']$/g, "");
      if (cleaned.length > 0) {
        if (validEUCountries.includes(cleaned)) {
          cleanedCountries.push(cleaned);
        } else if (cleaned !== "other") {
          // This is a custom country (not in the EU list and not "other")
          customCountries.push(cleaned);
        }
      }
    });

    // Join custom countries for the "Other Countries" field
    otherCountries = customCountries.join(", ");

    console.log("Cleaned EU countries:", cleanedCountries);
    console.log("Custom countries:", otherCountries);

    // Prepare data for Airtable using correct field names
    const airtableData = {
      records: [
        {
          fields: {
            "First Name": formData.firstName,
            "Last Name": formData.lastName,
            Email: formData.email,
            Company: formData.company,
            Website: formData.website,
            "Sell Today": cleanedCountries,
            "Other Countries": otherCountries,
            Revenue: formData.revenue,
            Customers: formData.customers,
            "Commit Bratislava": formData.commitBratislava,
            "Commit Amsterdam": formData.commitAmsterdam,
            Expectations: formData.expectations || "",
            "Additional Information": formData.additionalInfo || "",
            "Submission Date": new Date().toISOString().split("T")[0],
            Status: "New",
          },
        },
      ],
    };

    // Send to Airtable
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(airtableData),
      }
    );

    if (!airtableResponse.ok) {
      const errorData = await airtableResponse.text();
      console.error("Airtable API Error:", errorData);

      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Failed to save data",
          details:
            process.env.NODE_ENV === "development"
              ? errorData
              : "Internal server error",
        }),
      };
    }

    const result = await airtableResponse.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        message: "Successfully added to waitlist",
        recordId: result.records[0].id,
      }),
    };
  } catch (error) {
    console.error("Function Error:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      }),
    };
  }
};
