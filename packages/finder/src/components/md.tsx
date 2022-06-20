import React from "react";

const getKey = (i: number, path = "") => `desc-${path}-${i}`;

export interface MdProps {
  /** Markdown string */
  s: string;
  /** Path for creating a unique key */
  path?: string;
}
export const Md: React.VFC<MdProps> = ({s, path}) => {
  const body: (JSX.Element | string)[] = [];
  let text = "";

  let inCode = false;
  let inBold = false;
  let inItal = false;
  for (let i = 0; i < s.length; ++i) {
    switch (s[i]) {
      case "`":
        {
          if (inCode) {
            body.push(<code key={getKey(i, path)}>{text}</code>);
            text = "";
          } else {
            body.push(text);
            text = "";
          }
          inCode = !inCode;
        }
        break;

      case "_":
        {
          if (s[i + 1] === "_") {
            if (inBold) {
              body.push(<strong key={getKey(i, path)}>{text}</strong>);
              text = "";
            } else {
              body.push(text);
              text = "";
            }
            inBold = !inBold;
            ++i;
          } else {
            if (inItal) {
              body.push(<i key={getKey(i, path)}>{text}</i>);
              text = "";
            } else {
              body.push(text);
              text = "";
            }
            inItal = !inItal;
          }
        }
        break;

      case "*":
        {
          if (s[i + 1] === "*") {
            if (inBold) {
              body.push(<strong key={getKey(i, path)}>{text}</strong>);
              text = "";
            } else {
              body.push(text);
              text = "";
            }
            inBold = !inBold;
            ++i;
          } else {
            if (inItal) {
              body.push(<i key={getKey(i, path)}>{text}</i>);
              text = "";
            } else {
              body.push(text);
              text = "";
            }
            inItal = !inItal;
          }
        }
        break;

      case "\n":
        {
          body.push(text, <br key={getKey(i, path)} />);
          text = "";
        }
        break;

      case "h":
        {
          if (s.substring(i, i + 4) !== "http") {
            text += "h";
            break;
          }
          let link = "http";
          let j;
          for (
            j = i + 5;
            j < s.length && s[j] != " " && s[j] != "\n" && s[j] != "\t";
            ++j
          ) {
            link += s[j];
          }

          body.push(
            <a key={getKey(i, path)} href={link} target="_blank">
              {link}
            </a>
          );
          text = "";
          i = j;
        }
        break;

      default:
        {
          text += s[i];
        }
        break;
    }
  }
  body.push(text);

  return <p>{body}</p>;
};
