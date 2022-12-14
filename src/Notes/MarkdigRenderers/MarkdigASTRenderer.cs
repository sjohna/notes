using ImGuiNET;
using Markdig.Syntax;
using Markdig.Syntax.Inlines;
using System;
using System.Collections.Generic;
using System.Text;

namespace Notes.MarkdigRenderers
{
    public class MarkdigASTRenderer : IMarkdigRenderer
    {
        private static Lazy<IMarkdigRenderer> lazyInstance = new Lazy<IMarkdigRenderer>(() => new MarkdigASTRenderer());

        public static IMarkdigRenderer Instance => lazyInstance.Value;

        public void Render(MarkdownDocument document)
        {
            ImGui.Text($"Document: {document.ToPositionText()}");
            foreach (var block in document)
            {
                RenderBlock(block as dynamic, 2);
            }
        }

        private void RenderBlock(Block block, int indent)
        {
            ImGui.Text($"{new String(' ', indent)}Block ({block.GetType().ToString()}): {block.ToPositionText()}");
        }

        private void RenderBlock(ContainerBlock block, int indent)
        {
            ImGui.Text($"{new String(' ', indent)}Block ({block.GetType().ToString()}): {block.ToPositionText()}");
            foreach (var childBlock in block)
            {
                RenderBlock(childBlock as dynamic, indent + 2);
            }
        }

        private void RenderBlock(LeafBlock block, int indent)
        {
            ImGui.Text($"{new String(' ', indent)}Block ({block.GetType().ToString()}): {block.ToPositionText()}");
            if (block.Inline == null) return;
            RenderInline(block.Inline as dynamic, indent + 2);
        }

        private void RenderInline(Inline inline, int indent)
        {
            ImGui.Text($"{new String(' ', indent)}Inline ({inline.GetType().ToString()}): {inline.ToPositionText()}");
        }

        private void RenderInline(ContainerInline inline, int indent)
        {
            ImGui.Text($"{new String(' ', indent)}Inline ({inline.GetType().ToString()}): {inline.ToPositionText()}");
            foreach (var childInline in inline)
            {
                RenderInline(childInline as dynamic, indent + 2);
            }
        }

        private void RenderInline(LeafInline inline, int indent)
        {
            ImGui.Text($"{new String(' ', indent)}Inline ({inline.GetType().ToString()}): {inline.ToPositionText()}");
            ImGui.Text($"{new String(' ', indent + 1)}{inline.ToString()}");
        }
    }
}
