// deno-lint-ignore no-explicit-any
export default function approveOrDenyBlock(inputs: any): any[] {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `署名を求める？ (Send for Signature?)`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `時間エントリー (Time Entries):\n${inputs.table}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `祝日経過 (Holidays Passed): ${inputs.holidays}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `コメント (Comments):\n ${inputs.comments}`,
      },
    },
  ];
}