import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Header } from "./Header";

export default {
  title: "Blocks/Header",
  component: Header,
  argTypes: {
    onLanguageSelect: {},
    onThemeButtonClick: {},
    onLoginClick: {},
  },
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof Header>;

const Template: ComponentStory<typeof Header> = (args, context) => (
  <Header
    selectedLanguage={context.globals.lang}
    onLanguageSelect={args.onLanguageSelect}
    onThemeButtonClick={args.onThemeButtonClick}
    selectedTheme={context.globals.theme}
    onLoginClick={args.onLoginClick}
  />
);

export const Default = Template.bind({});
Default.args = {
  onLoginClick: () => console.log('Login clicked'),
};
