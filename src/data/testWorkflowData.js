// Test API response data for workflow: twflow_b210db0a85
// This represents the actual API response structure from the Rubik API

export const testWorkflowResponse = {
  "workflowId": "twflow_b210db0a85",
  "definition": {
    "nodes": {
      "categorizeEmailNode": {
        "nodeName": "Determine category for email node",
        "nodeId": "categorize-email-node",
        "nodeParams": {"params": {}},
        "nodeInputs": {},
        "nodeType": "Activity",
        "activityName": "categorize_email_activity",
        "startToCloseTimeoutInMinutes": 1.0
      },
      "emailCreateTriggerNode": {
        "nodeName": "Create Email Trigger Node",
        "nodeId": "email-create-trigger-node",
        "nodeParams": {"params": {}},
        "nodeInputs": {},
        "nodeType": "Trigger",
        "activityName": "create_or_update_mail_trigger",
        "startToCloseTimeoutInMinutes": 1.0
      },
      "paymentAdviceParsingNode": {
        "nodeName": "Parse contents of payment advice",
        "nodeId": "payment-advice-parsing-node",
        "nodeParams": {"params": {"emailId": "$edge3.email_id"}},
        "nodeInputs": {},
        "nodeType": "Activity",
        "activityName": "payment_advice_parsing_activity",
        "startToCloseTimeoutInMinutes": 10.0
      },
      "isPaymentAdviceSharedController": {
        "nodeName": "Check if payment advice is shared",
        "nodeId": "is-payment-advice-shared-controller",
        "nodeParams": {
          "params": {
            "condition": {
              "dataclassDict": "{\"_type\": \"STATEMENT_TYPE\", \"lhs\": {\"left_statement\": null, \"right_statement\": null, \"operator\": null, \"value_placeholder\": \"$edge2.categorization.categories[0]\", \"value\": null}, \"rhs\": {\"left_statement\": null, \"right_statement\": null, \"operator\": null, \"value_placeholder\": null, \"value\": \"PAYMENT_ADVICE_SHARED\"}, \"operator\": \"CONTAINS\"}"
            },
            "inputEdgeName": "edge2",
            "trueEdgeOutput": "edge3"
          }
        },
        "nodeInputs": {},
        "nodeType": "Controller",
        "activityName": "if_else_activity",
        "startToCloseTimeoutInMinutes": 1.0
      }
    },
    "edges": [
      {"fromNodeId": "email-create-trigger-node", "toNodeId": "categorize-email-node", "edgeName": "edge1"},
      {"fromNodeId": "categorize-email-node", "toNodeId": "is-payment-advice-shared-controller", "edgeName": "edge2"},
      {"fromNodeId": "is-payment-advice-shared-controller", "toNodeId": "payment-advice-parsing-node", "edgeName": "edge3"}
    ]
  }
};

// Additional test workflows can be added here for different scenarios
export const alternativeTestWorkflow = {
  "workflowId": "twflow_alternative",
  "definition": {
    "nodes": {
      "simpleEmailTrigger": {
        "nodeName": "Simple Email Trigger",
        "nodeId": "simple-email-trigger",
        "nodeParams": {"params": {}},
        "nodeInputs": {},
        "nodeType": "Trigger",
        "activityName": "email_trigger_activity",
        "startToCloseTimeoutInMinutes": 1.0
      },
      "processEmailActivity": {
        "nodeName": "Process Email Content",
        "nodeId": "process-email-activity",
        "nodeParams": {"params": {}},
        "nodeInputs": {},
        "nodeType": "Activity",
        "activityName": "process_email_activity",
        "startToCloseTimeoutInMinutes": 5.0
      }
    },
    "edges": [
      {"fromNodeId": "simple-email-trigger", "toNodeId": "process-email-activity", "edgeName": "edge1"}
    ]
  }
};
