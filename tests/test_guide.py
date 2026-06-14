from server.guide import _gemini_contents, _split_technical, DEFAULT_GEMINI_MODEL


def test_split_technical():
    answer, tech = _split_technical("Plain answer.\nTechnical: vib_z · S4")
    assert answer == "Plain answer."
    assert tech == "vib_z · S4"


def test_gemini_contents_maps_assistant_to_model():
    contents = _gemini_contents(
        [{"role": "user", "content": "Hi"}, {"role": "assistant", "content": "Hello"}],
        "Next question",
    )
    assert contents[0]["role"] == "user"
    assert contents[1]["role"] == "model"
    assert contents[2]["role"] == "user"
    assert contents[2]["parts"][0]["text"] == "Next question"


def test_default_model_is_gemini_flash_lite():
    assert DEFAULT_GEMINI_MODEL == "gemini-3.1-flash-lite"
